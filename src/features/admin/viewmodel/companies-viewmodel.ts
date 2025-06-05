// src/features/admin/viewmodel/companies-viewmodel.ts - CORRIGIDO
import { useState } from 'react'
import { toast } from 'sonner'

import { CompaniesService } from '../services/companies-service'
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from '@/types/graphql'

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
      this.setLoading(true)
      const companies = await this.companiesService.getCompanies()
      // CORREÇÃO: Criar uma nova cópia do array para evitar mutação
      this.setCompanies([...companies])
    } catch (error: any) {
      console.error('Error loading companies:', error)
      toast.error('Erro ao carregar empresas', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadCompaniesByPlace(placeId: number): Promise<void> {
    try {
      this.setLoading(true)
      const companies = await this.companiesService.getCompaniesByPlace(placeId)
      // CORREÇÃO: Criar uma nova cópia do array para evitar mutação
      this.setCompanies([...companies])
    } catch (error: any) {
      console.error('Error loading companies by place:', error)
      toast.error('Erro ao carregar empresas do place', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async createCompany(input: CreateCompanyInput): Promise<void> {
    try {
      this.setLoading(true)
      const newCompany = await this.companiesService.createCompany(input)
      // CORREÇÃO: Criar uma nova cópia do array com a nova empresa
      this.setCompanies([...this.companies, newCompany])

      toast.success('Empresa criada com sucesso!', {
        description: `${newCompany.name} foi adicionada.`,
      })
    } catch (error: any) {
      console.error('Error creating company:', error)
      toast.error('Erro ao criar empresa', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async updateCompany(input: UpdateCompanyInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedCompany = await this.companiesService.updateCompany(input)
      // CORREÇÃO: Criar uma nova cópia do array com a empresa atualizada
      const updatedCompanies = this.companies.map((company) =>
        company.id === updatedCompany.id ? { ...updatedCompany } : company,
      )
      this.setCompanies([...updatedCompanies])

      toast.success('Empresa atualizada com sucesso!', {
        description: `${updatedCompany.name} foi atualizada.`,
      })
    } catch (error: any) {
      console.error('Error updating company:', error)
      toast.error('Erro ao atualizar empresa', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async deleteCompany(id: number, name: string): Promise<void> {
    try {
      this.setLoading(true)
      await this.companiesService.deleteCompany(id)
      // CORREÇÃO: Criar uma nova cópia do array sem a empresa removida
      const filteredCompanies = this.companies.filter(
        (company) => Number(company.id) !== id,
      )
      this.setCompanies([...filteredCompanies])

      toast.success('Empresa removida com sucesso!', {
        description: `${name} foi removida.`,
      })
    } catch (error: any) {
      console.error('Error deleting company:', error)
      toast.error('Erro ao remover empresa', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message
    }
    if (error?.networkError?.message) {
      return 'Erro de conexão com o servidor'
    }
    return 'Erro interno do servidor'
  }
}

export function useCompaniesViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<Array<Company>>([])
  const companiesService = new CompaniesService()

  const viewModel = new CompaniesViewModel(
    companiesService,
    setIsLoading,

    (newCompanies) => setCompanies([...newCompanies]),
    companies,
  )

  return {
    viewModel,
    isLoading,
    companies,
  }
}
