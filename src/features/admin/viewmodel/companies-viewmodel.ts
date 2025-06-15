// src/features/admin/viewmodel/companies-viewmodel.ts

import { useState } from 'react'
import { toast } from 'sonner'
import { CompaniesService } from '../services/companies-service'
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from '../services/companies-service'
import type { Company } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export class CompaniesViewModel {
  private companiesService: CompaniesService
  private setLoading: (loading: boolean) => void
  private setCompanies: (companies: Array<Company>) => void
  private companies: Array<Company>

  constructor(
    companiesService: CompaniesService,
    setLoading: (loading: boolean) => void,
    setCompanies: (companies: Array<Company>) => void,
    companies: Array<Company>,
  ) {
    this.companiesService = companiesService
    this.setLoading = setLoading
    this.setCompanies = setCompanies
    this.companies = companies
  }

  async loadCompanies(): Promise<void> {
  try {
    console.log('=== LOAD COMPANIES VIEWMODEL START ===');
    this.setLoading(true);
    
    // Limpar cache primeiro
    await apolloClient.resetStore();
    
    const companies = await this.companiesService.getCompanies();
    console.log('Companies loaded in viewmodel:', {
      count: companies.length,
      companies: companies.map(c => ({ id: c.id, name: c.name }))
    });
    
    this.setCompanies([...companies]);
    
    toast.success(`${companies.length} empresas carregadas com sucesso!`);
  } catch (error: any) {
    console.error('Error loading companies:', error);
    toast.error('Erro ao carregar empresas', {
      description: this.getErrorMessage(error),
    });
    // Não fazer throw para não quebrar a UI
  } finally {
    this.setLoading(false);
  }
}

  /**
   * Carregar empresas por place
   */
  async loadCompaniesByPlace(placeId: number): Promise<void> {
    try {
      console.log('=== COMPANIES VIEWMODEL LOAD BY PLACE DEBUG START ===')
      console.log('Place ID:', placeId)
      
      this.setLoading(true)
      const companies = await this.companiesService.getCompaniesByPlace(placeId)
      
      console.log(`ViewModel loaded ${companies.length} companies for place ${placeId}`)
      this.setCompanies([...companies])
      
      console.log('=== COMPANIES VIEWMODEL LOAD BY PLACE DEBUG END ===')
    } catch (error: any) {
      console.error('=== COMPANIES VIEWMODEL LOAD BY PLACE ERROR ===')
      console.error('Error loading companies by place:', error)
      
      toast.error('Erro ao carregar empresas do place', {
        description: this.getErrorMessage(error),
      })
      
      this.setCompanies([])
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Criar empresa
   */
  async createCompany(input: CreateCompanyInput): Promise<void> {
    try {
      console.log('=== COMPANIES VIEWMODEL CREATE DEBUG START ===')
      console.log('Create input:', input)
      
      // Validar entrada
      const errors = this.companiesService.validateCreateCompanyInput(input)
      if (errors.length > 0) {
        toast.error('Erro de validação', {
          description: errors.join(', '),
        })
        throw new Error(errors.join(', '))
      }

      this.setLoading(true)
      const newCompany = await this.companiesService.createCompany(input)
      
      // Adicionar à lista local
      this.setCompanies([...this.companies, newCompany])

      toast.success('Empresa criada com sucesso!', {
        description: `${newCompany.name} foi adicionada.`,
      })
      
      console.log('=== COMPANIES VIEWMODEL CREATE DEBUG END ===')
    } catch (error: any) {
      console.error('=== COMPANIES VIEWMODEL CREATE ERROR ===')
      console.error('Error creating company:', error)
      
      if (!error.message.includes('validação')) {
        toast.error('Erro ao criar empresa', {
          description: this.getErrorMessage(error),
        })
      }
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Atualizar empresa
   */
  async updateCompany(input: UpdateCompanyInput): Promise<void> {
    try {
      console.log('=== COMPANIES VIEWMODEL UPDATE DEBUG START ===')
      
      this.setLoading(true)
      const updatedCompany = await this.companiesService.updateCompany(input)
      
      const updatedCompanies = this.companies.map((company) =>
        company.id === updatedCompany.id ? { ...updatedCompany } : company,
      )
      this.setCompanies([...updatedCompanies])

      toast.success('Empresa atualizada com sucesso!', {
        description: `${updatedCompany.name} foi atualizada.`,
      })
      
      console.log('=== COMPANIES VIEWMODEL UPDATE DEBUG END ===')
    } catch (error: any) {
      console.error('=== COMPANIES VIEWMODEL UPDATE ERROR ===')
      console.error('Error updating company:', error)
      
      toast.error('Erro ao atualizar empresa', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Deletar empresa
   */
  async deleteCompany(id: number): Promise<void> {
    try {
      console.log('=== COMPANIES VIEWMODEL DELETE DEBUG START ===')
      
      const company = this.companies.find((c) => Number(c.id) === id)
      const companyName = company?.name || 'Empresa'

      this.setLoading(true)
      await this.companiesService.deleteCompany(id)
      
      const filteredCompanies = this.companies.filter(
        (company) => Number(company.id) !== id,
      )
      this.setCompanies([...filteredCompanies])

      toast.success('Empresa removida com sucesso!', {
        description: `${companyName} foi removida.`,
      })
      
      console.log('=== COMPANIES VIEWMODEL DELETE DEBUG END ===')
    } catch (error: any) {
      console.error('=== COMPANIES VIEWMODEL DELETE ERROR ===')
      console.error('Error deleting company:', error)
      
      toast.error('Erro ao remover empresa', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Obter mensagem de erro formatada
   */
  private getErrorMessage(error: any): string {
    // Verificar erros GraphQL
    if (error?.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message
    }
    
    // Verificar erros de rede
    if (error?.networkError?.message) {
      return 'Erro de conexão com o servidor'
    }
    
    // Erro genérico
    return error?.message || 'Erro interno do servidor'
  }
}

/**
 * Hook para usar o ViewModel
 */
export function useCompaniesViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<Array<Company>>([])
  const companiesService = new CompaniesService()

  const viewModel = new CompaniesViewModel(
    companiesService,
    setIsLoading,
    (newCompanies) => {
      console.log('Hook - Setting companies:', newCompanies.length)
      setCompanies([...newCompanies])
    },
    companies,
  )

  return {
    viewModel,
    isLoading,
    companies,
  }
}