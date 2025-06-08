// src/features/admin/viewmodel/companies-viewmodel.ts - ENHANCED WITH SEGMENTATION
import { useState } from 'react'
import { toast } from 'sonner'
import { CompaniesService } from '../services/companies-service'
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from '../services/companies-service'
import type { Company } from '@/types/graphql'

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
      this.setCompanies([...this.companies, newCompany])

      toast.success('Empresa criada com sucesso!', {
        description: `${newCompany.name} foi adicionada.`,
      })
    } catch (error: any) {
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

  async updateCompany(input: UpdateCompanyInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedCompany = await this.companiesService.updateCompany(input)
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

  async deleteCompany(id: number): Promise<void> {
    try {
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

  /**
   * Filtrar empresas por critérios incluindo segmentação
   */
  filterCompanies(filters: {
    search?: string
    isActive?: boolean
    hasUsers?: boolean
    placeId?: number
    categoryId?: number
    subcategoryId?: number
    segmentId?: string
  }): Array<Company> {
    return this.companies.filter((company) => {
      // Filtro de busca por texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchable = [
          company.name,
          company.description,
          company.place.name || '',
          company.slug,
          company.category?.name || '',
          company.subcategory?.name || '',
          company.category?.segments?.map((s) => s.name).join(' ') || '',
        ]
          .join(' ')
          .toLowerCase()

        if (!searchable.includes(searchTerm)) {
          return false
        }
      }

      // Filtro por status ativo
      if (
        filters.isActive !== undefined &&
        company.isActive !== filters.isActive
      ) {
        return false
      }

      // Filtro por ter usuários
      if (filters.hasUsers !== undefined) {
        const hasUsers = !!(company.users && company.users.length > 0)
        if (hasUsers !== filters.hasUsers) {
          return false
        }
      }

      // Filtro por place
      if (filters.placeId && Number(company.placeId) !== filters.placeId) {
        return false
      }

      // Filtro por categoria
      if (filters.categoryId) {
        if (
          !company.categoryId ||
          Number(company.categoryId) !== filters.categoryId
        ) {
          return false
        }
      }

      // Filtro por subcategoria
      if (filters.subcategoryId) {
        if (
          !company.subcategoryId ||
          Number(company.subcategoryId) !== filters.subcategoryId
        ) {
          return false
        }
      }

      // Filtro por segmento
      if (filters.segmentId) {
        if (
          !company.category?.segments?.some(
            (segment) => segment.id === filters.segmentId,
          )
        ) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Obter empresa por ID
   */
  getCompanyById(id: string): Company | undefined {
    return this.companies.find((company) => company.id === id)
  }

  /**
   * Ordenar empresas
   */
  sortCompanies(
    companies: Array<Company>,
    sortBy: 'name' | 'created' | 'place' = 'name',
  ): Array<Company> {
    return [...companies].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'place': {
          const placeA = a.place.name || ''
          const placeB = b.place.name || ''
          if (placeA !== placeB) {
            return placeA.localeCompare(placeB)
          }
          return a.name.localeCompare(b.name)
        }
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })
  }

  /**
   * Agrupar empresas por categoria
   */
  groupCompaniesByCategory(
    companies: Array<Company>,
  ): Record<string, Array<Company>> {
    const groups: Record<string, Array<Company>> = {}

    companies.forEach((company) => {
      const categoryName = company.category?.name || 'Sem categoria'

      groups[categoryName] = []

      groups[categoryName].push(company)
    })

    // Ordenar empresas dentro de cada grupo
    Object.keys(groups).forEach((categoryName) => {
      groups[categoryName] = this.sortCompanies(groups[categoryName])
    })

    return groups
  }

  /**
   * Agrupar empresas por segmento
   */
  groupCompaniesBySegment(
    companies: Array<Company>,
  ): Record<string, Array<Company>> {
    const groups: Record<string, Array<Company>> = {}

    companies.forEach((company) => {
      if (company.category?.segments && company.category.segments.length > 0) {
        // Uma empresa pode estar em múltiplos segmentos através da categoria
        company.category.segments.forEach((segment) => {
          const segmentName = segment.name || 'Sem nome'

          groups[segmentName] = []

          // Evitar duplicatas
          if (!groups[segmentName].some((c) => c.id === company.id)) {
            groups[segmentName].push(company)
          }
        })
      } else {
        // Empresas sem segmento
        const groupName = 'Sem segmento'

        groups[groupName].push(company)
      }
    })

    // Ordenar empresas dentro de cada grupo
    Object.keys(groups).forEach((segmentName) => {
      groups[segmentName] = this.sortCompanies(groups[segmentName])
    })

    return groups
  }

  /**
   * Obter estatísticas das empresas com segmentação
   */
  async getCompaniesStats(): Promise<{
    total: number
    active: number
    inactive: number
    withUsers: number
    withoutUsers: number
    categorized: number
    uncategorized: number
    byPlace: Record<string, number>
    byCategory: Record<string, number>
    bySegment: Record<string, number>
  }> {
    try {
      const stats = {
        total: this.companies.length,
        active: this.companies.filter((c) => c.isActive).length,
        inactive: this.companies.filter((c) => !c.isActive).length,
        withUsers: this.companies.filter((c) => c.users && c.users.length > 0)
          .length,
        withoutUsers: this.companies.filter(
          (c) => !c.users || c.users.length === 0,
        ).length,
        categorized: this.companies.filter(
          (c) => c.categoryId || c.subcategoryId,
        ).length,
        uncategorized: this.companies.filter(
          (c) => !c.categoryId && !c.subcategoryId,
        ).length,
        byPlace: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        bySegment: {} as Record<string, number>,
      }

      // Estatísticas por place
      this.companies.forEach((company) => {
        const placeName = company.place.name || 'Sem place'
        stats.byPlace[placeName] = (stats.byPlace[placeName] || 0) + 1
      })

      // Estatísticas por categoria
      this.companies.forEach((company) => {
        const categoryName = company.category?.name || 'Sem categoria'
        stats.byCategory[categoryName] =
          (stats.byCategory[categoryName] || 0) + 1
      })

      // Estatísticas por segmento
      this.companies.forEach((company) => {
        if (
          company.category?.segments &&
          company.category.segments.length > 0
        ) {
          company.category.segments.forEach((segment) => {
            const segmentName = segment.name || 'Sem nome'
            stats.bySegment[segmentName] =
              (stats.bySegment[segmentName] || 0) + 1
          })
        } else {
          stats.bySegment['Sem segmento'] =
            (stats.bySegment['Sem segmento'] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting companies stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withUsers: 0,
        withoutUsers: 0,
        categorized: 0,
        uncategorized: 0,
        byPlace: {},
        byCategory: {},
        bySegment: {},
      }
    }
  }

  /**
   * Obter empresas não categorizadas
   */
  getUncategorizedCompanies(): Array<Company> {
    return this.companies.filter(
      (company) => !company.categoryId && !company.subcategoryId,
    )
  }

  /**
   * Obter empresas por categoria específica
   */
  getCompaniesByCategory(categoryId: string): Array<Company> {
    return this.companies.filter(
      (company) =>
        company.categoryId && company.categoryId.toString() === categoryId,
    )
  }

  /**
   * Obter empresas por subcategoria específica
   */
  getCompaniesBySubcategory(subcategoryId: string): Array<Company> {
    return this.companies.filter(
      (company) =>
        company.subcategoryId &&
        company.subcategoryId.toString() === subcategoryId,
    )
  }

  /**
   * Obter empresas por segmento específico
   */
  getCompaniesBySegment(segmentId: string): Array<Company> {
    return this.companies.filter((company) =>
      company.category?.segments?.some((segment) => segment.id === segmentId),
    )
  }

  /**
   * Verificar se empresa tem administradores
   */
  hasAdmins(company: Company): boolean {
    return !!(
      company.users &&
      company.users.some((user) =>
        user.userRoles?.some((ur) => ur.role.name === 'COMPANY_ADMIN'),
      )
    )
  }

  /**
   * Obter empresas sem administradores
   */
  getCompaniesWithoutAdmins(): Array<Company> {
    return this.companies.filter((company) => !this.hasAdmins(company))
  }

  /**
   * Formatar empresa para exibição
   */
  formatCompanyForDisplay(company: Company): any {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      phone: company.phone || 'Não informado',
      email: company.email || 'Não informado',
      website: company.website || 'Não informado',
      address: company.address || 'Não informado',
      placeName: company.place.name || 'Place não encontrado',
      placeCity: company.place.city || '',
      placeState: company.place.state || '',
      categoryName: company.category?.name || 'Sem categoria',
      subcategoryName: company.subcategory?.name || 'Sem subcategoria',
      segmentNames: company.category?.segments?.map((s) => s.name) || [],
      isActive: company.isActive,
      hasLocation: !!(company.latitude && company.longitude),
      openingHours: company.openingHours || 'Não informado',
      adminsCount:
        company.users?.filter((u) =>
          u.userRoles?.some((ur) => ur.role.name === 'COMPANY_ADMIN'),
        ).length || 0,
      staffCount:
        company.users?.filter((u) =>
          u.userRoles?.some((ur) => ur.role.name === 'COMPANY_STAFF'),
        ).length || 0,
      createdAt: new Date(company.createdAt).toLocaleDateString('pt-BR'),
      updatedAt: new Date(company.updatedAt).toLocaleDateString('pt-BR'),
    }
  }

  /**
   * Buscar empresas com filtros avançados
   */
  async searchCompanies(filters: {
    search?: string
    placeId?: number
    categoryId?: number
    subcategoryId?: number
    segmentId?: string
    isActive?: boolean
    hasUsers?: boolean
    hasAdmins?: boolean
  }): Promise<Array<Company>> {
    try {
      // Para busca mais avançada, você pode implementar uma query específica no service
      // Por enquanto, usar o filtro local
      return this.filterCompanies(filters)
    } catch (error) {
      console.error('Error searching companies:', error)
      return []
    }
  }

  /**
   * Validar se os dados de segmentação são consistentes
   */
  validateSegmentationData(data: {
    placeId: number
    segmentId?: number
    categoryId?: number
    subcategoryId?: number
  }): Array<string> {
    const errors: Array<string> = []

    // Se tem subcategoria, deve ter categoria
    if (data.subcategoryId && !data.categoryId) {
      errors.push('Subcategoria requer uma categoria selecionada')
    }

    // Validações adicionais podem ser feitas aqui
    // Por exemplo, verificar se categoria pertence ao segmento, etc.

    return errors
  }

  /**
   * Obter sugestões de categorização baseado no nome/descrição da empresa
   */
  getSuggestedCategories(
    companyName: string,
    companyDescription: string,
  ): Array<{
    categoryId: string
    categoryName: string
    score: number
    reason: string
  }> {
    // Implementação simples baseada em palavras-chave
    // Em um sistema real, isso poderia usar ML/AI
    const suggestions: Array<{
      categoryId: string
      categoryName: string
      score: number
      reason: string
    }> = []

    const searchText = `${companyName} ${companyDescription}`.toLowerCase()

    // Categorizar empresas baseado em palavras-chave comuns
    const categoryKeywords = {
      restaurante: [
        'restaurante',
        'comida',
        'alimentação',
        'culinária',
        'gastronomia',
      ],
      tecnologia: [
        'tecnologia',
        'software',
        'desenvolvimento',
        'sistemas',
        'digital',
      ],
      saúde: ['saúde', 'médico', 'clínica', 'hospital', 'farmácia'],
      educação: ['educação', 'escola', 'curso', 'ensino', 'aprendizado'],
      varejo: ['loja', 'varejo', 'vendas', 'comércio', 'mercado'],
    }

    Object.entries(categoryKeywords).forEach(([categoryName, keywords]) => {
      const matchingKeywords = keywords.filter((keyword) =>
        searchText.includes(keyword),
      )

      if (matchingKeywords.length > 0) {
        suggestions.push({
          categoryId: categoryName, // Em um sistema real, seria o ID real
          categoryName,
          score: matchingKeywords.length,
          reason: `Palavras-chave encontradas: ${matchingKeywords.join(', ')}`,
        })
      }
    })

    return suggestions.sort((a, b) => b.score - a.score)
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
