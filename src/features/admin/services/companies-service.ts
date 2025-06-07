// src/features/admin/services/companies-service.ts - COMPLETE ENHANCED VERSION

import {
  CREATE_COMPANY_MUTATION,
  CREATE_COMPANY_WITH_USERS_MUTATION,
  DELETE_COMPANY_MUTATION,
  GET_COMPANIES_BY_PLACE_QUERY,
  GET_COMPANIES_QUERY,
  GET_COMPANY_BY_ID_QUERY,
  GET_COMPANY_WITH_USERS_QUERY,
  UPDATE_COMPANY_MUTATION,
} from './companies-queries'
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
  User,
} from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'
import { GET_AVAILABLE_USERS_FOR_COMPANY_QUERY } from '@/features/auth/services/company-auth-queries'

export type { CreateCompanyInput, UpdateCompanyInput }

export class CompaniesService {
  /**
   * Criar empresa básica (sem usuários)
   */
  async createCompany(input: CreateCompanyInput): Promise<Company> {
    try {
      const cleanInput = this.cleanCompanyInput(input)

      console.log('Creating basic company with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_COMPANY_MUTATION,
        variables: { createCompanyInput: cleanInput },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })

      return data.createCompany as Company
    } catch (error) {
      console.error('Create company error:', error)
      throw error
    }
  }

  /**
   * Criar empresa avançada (com usuários)
   */
  async createCompanyWithUsers(input: CreateCompanyInput): Promise<Company> {
    try {
      const cleanInput = this.cleanEnhancedCompanyInput(input)

      console.log('Creating company with users:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_COMPANY_WITH_USERS_MUTATION,
        variables: { createCompanyInput: cleanInput },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })

      return data.createCompanyWithUsers as Company
    } catch (error) {
      console.error('Create company with users error:', error)
      throw error
    }
  }

  /**
   * Atualizar empresa existente
   */
  async updateCompany(input: UpdateCompanyInput): Promise<Company> {
    try {
      const cleanInput = this.cleanUpdateCompanyInput(input)

      console.log('Updating company with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_COMPANY_MUTATION,
        variables: { updateCompanyInput: cleanInput },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })

      return data.updateCompany as Company
    } catch (error) {
      console.error('Update company error:', error)
      throw error
    }
  }

  /**
   * Deletar empresa
   */
  async deleteCompany(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_COMPANY_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })
    } catch (error) {
      console.error('Delete company error:', error)
      throw error
    }
  }

  /**
   * Buscar todas as empresas
   */
  async getCompanies(): Promise<Array<Company>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANIES_QUERY,
        fetchPolicy: 'cache-first',
      })

      console.log('Companies data received:', data)

      // Retornar diretamente o array de companies
      return data.companies as Array<Company>
    } catch (error) {
      console.error('Get companies error:', error)
      throw error
    }
  }

  /**
   * Buscar empresa por ID
   */
  async getCompanyById(id: string): Promise<Company> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANY_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.company as Company
    } catch (error) {
      console.error('Get company by id error:', error)
      throw error
    }
  }

  /**
   * Buscar empresas por place
   */
  async getCompaniesByPlace(placeId: number): Promise<Array<Company>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANIES_BY_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.companiesByPlace as Array<Company>
    } catch (error) {
      console.error('Get companies by place error:', error)
      throw error
    }
  }

  /**
   * Buscar usuários disponíveis para uma empresa
   */
  async getAvailableUsersForCompany(placeId: number): Promise<Array<User>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_AVAILABLE_USERS_FOR_COMPANY_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.availableUsersForCompany as Array<User>
    } catch (error) {
      console.error('Get available users for company error:', error)
      throw error
    }
  }

  /**
   * Limpar dados de entrada para criação básica de empresa
   */
  private cleanCompanyInput(input: CreateCompanyInput): CreateCompanyInput {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([key, value]) => {
        // Remover valores undefined, null ou strings vazias
        if (value === undefined || value === null || value === '') {
          return false
        }

        // Remover latitude/longitude se forem zero (considerados inválidos)
        if ((key === 'latitude' || key === 'longitude') && value === 0) {
          return false
        }

        return true
      }),
    ) as CreateCompanyInput

    return cleanInput
  }

  /**
   * Limpar dados de entrada para criação avançada de empresa
   */
  private cleanEnhancedCompanyInput(
    input: CreateCompanyInput,
  ): CreateCompanyInput {
    // Primeiro limpar os dados básicos da empresa
    const { users, ...companyData } = input
    const cleanCompanyData = this.cleanCompanyInput(
      companyData as CreateCompanyInput,
    )

    // Processar usuários se existirem
    let cleanUsers: Array<User> = []
    if (users && users.length > 0) {
      cleanUsers = users
        .filter((user) => {
          // Filtrar usuários válidos
          const hasExistingUser = user.existingUserId && user.existingUserId > 0
          const hasNewUserData = user.name && user.email && user.password
          return hasExistingUser || hasNewUserData
        })
        .map((user) => {
          const cleanUser: any = {}

          // Para usuário existente
          if (user.existingUserId) {
            cleanUser.existingUserId = user.existingUserId
          }

          // Para novo usuário
          if (user.name) {
            cleanUser.name = user.name.trim()
          }
          if (user.email) {
            cleanUser.email = user.email.trim()
          }
          if (user.password) {
            cleanUser.password = user.password
          }
          if (user.phone && user.phone.trim()) {
            cleanUser.phone = user.phone.trim()
          }

          // Campos comuns
          cleanUser.role = user.role || 'COMPANY_STAFF'
          cleanUser.isActive = user.isActive !== false

          return cleanUser
        })
    }

    const result: CreateCompanyInput = {
      ...cleanCompanyData,
      users: cleanUsers.length > 0 ? cleanUsers : undefined,
    }

    return result
  }

  /**
   * Limpar dados de entrada para atualização de empresa
   */
  private cleanUpdateCompanyInput(
    input: UpdateCompanyInput,
  ): UpdateCompanyInput {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([key, value]) => {
        // Sempre manter o ID
        if (key === 'id') return true

        // Remover valores undefined, null ou strings vazias
        if (value === undefined || value === null || value === '') {
          return false
        }

        // Remover latitude/longitude se forem zero (considerados inválidos)
        if ((key === 'latitude' || key === 'longitude') && value === 0) {
          return false
        }

        return true
      }),
    ) as UpdateCompanyInput

    return cleanInput
  }

  /**
   * Validar dados de entrada para criação de empresa
   */
  validateCreateCompanyInput(input: CreateCompanyInput): Array<string> {
    const errors: Array<string> = []

    if (!input.name || input.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }

    if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens')
    }

    if (!input.description || input.description.trim().length < 1) {
      errors.push('Descrição é obrigatória')
    }

    if (!input.placeId || input.placeId < 1) {
      errors.push('Place é obrigatório')
    }

    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.push('Email deve ser válido')
    }

    if (input.website && !/^https?:\/\/.+/.test(input.website)) {
      errors.push('Website deve ser uma URL válida')
    }

    if (input.logo && !/^https?:\/\/.+/.test(input.logo)) {
      errors.push('Logo deve ser uma URL válida')
    }

    if (input.banner && !/^https?:\/\/.+/.test(input.banner)) {
      errors.push('Banner deve ser uma URL válida')
    }

    return errors
  }

  /**
   * Validar dados de entrada para criação avançada
   */
  validateCreateEnhancedInput(input: CreateCompanyInput): Array<string> {
    const errors: Array<string> = []

    // Validar dados básicos da empresa
    const companyErrors = this.validateCreateCompanyInput(input)
    errors.push(...companyErrors)

    // Validar usuários se fornecidos
    if (input.users && input.users.length > 0) {
      input.users.forEach((user, index) => {
        const userPrefix = `Usuário ${index + 1}:`

        // Validar usuário existente
        if (user.existingUserId) {
          if (user.existingUserId < 1) {
            errors.push(`${userPrefix} ID de usuário existente inválido`)
          }
        }
        // Validar novo usuário
        else {
          if (!user.name || user.name.trim().length < 2) {
            errors.push(`${userPrefix} Nome deve ter pelo menos 2 caracteres`)
          }

          if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.push(`${userPrefix} Email deve ser válido`)
          }

          if (!user.password || user.password.length < 6) {
            errors.push(`${userPrefix} Senha deve ter pelo menos 6 caracteres`)
          }
        }

        // Validar role
        if (
          user.role &&
          !['COMPANY_ADMIN', 'COMPANY_STAFF'].includes(user.role)
        ) {
          errors.push(
            `${userPrefix} Função deve ser COMPANY_ADMIN ou COMPANY_STAFF`,
          )
        }
      })
    }

    return errors
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
      isActive: company.isActive,
      hasLocation: !!(company.latitude && company.longitude),
      openingHours: company.openingHours || 'Não informado',
      createdAt: new Date(company.createdAt).toLocaleDateString('pt-BR'),
      updatedAt: new Date(company.updatedAt).toLocaleDateString('pt-BR'),
    }
  }

  /**
   * Gerar slug a partir do nome
   */
  generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .replace(/^-|-$/g, '') // Remove hífens no início/fim
  }

  /**
   * Verificar se slug está disponível
   */
  async isSlugAvailable(
    slug: string,
    excludeCompanyId?: number,
  ): Promise<boolean> {
    try {
      const companies = await this.getCompanies()

      return !companies.some(
        (company) =>
          company.slug === slug &&
          (!excludeCompanyId || Number(company.id) !== excludeCompanyId),
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }

  /**
   * Buscar empresas com filtros
   */
  async searchCompanies(filters: {
    search?: string
    placeId?: number
    isActive?: boolean
    hasUsers?: boolean
  }): Promise<Array<Company>> {
    try {
      let companies: Array<Company>

      if (filters.placeId) {
        companies = await this.getCompaniesByPlace(filters.placeId)
      } else {
        companies = await this.getCompanies()
      }

      // Aplicar filtros
      return companies.filter((company) => {
        // Filtro de busca por texto
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          const searchable = [
            company.name,
            company.description,
            company.place.name,
            company.slug,
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

        return true
      })
    } catch (error) {
      console.error('Error searching companies:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas das empresas
   */
  async getCompaniesStats(): Promise<{
    total: number
    active: number
    inactive: number
    withUsers: number
    withoutUsers: number
    byPlace: Record<string, number>
  }> {
    try {
      const companies = await this.getCompanies()

      const stats = {
        total: companies.length,
        active: companies.filter((c) => c.isActive).length,
        inactive: companies.filter((c) => !c.isActive).length,
        withUsers: companies.filter((c) => c.users && c.users.length > 0)
          .length,
        withoutUsers: companies.filter((c) => !c.users || c.users.length === 0)
          .length,
        byPlace: {} as Record<string, number>,
      }

      // Estatísticas por place
      companies.forEach((company) => {
        const placeName = company.place.name || 'Sem place'
        stats.byPlace[placeName] = (stats.byPlace[placeName] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting companies stats:', error)
      throw error
    }
  }

  /**
   * Buscar empresa com detalhes completos dos usuários
   * Específico para gestão de admins
   */
  async getCompanyWithUsersDetails(id: number): Promise<Company> {
    try {
      console.log('Getting company with users details for ID:', id)

      const { data } = await apolloClient.query({
        query: GET_COMPANY_WITH_USERS_QUERY,
        variables: { id },
        fetchPolicy: 'network-only', // Sempre buscar dados frescos
      })

      console.log('Company with users details received:', {
        id: data.companyDetails.id,
        name: data.companyDetails.name,
        usersCount: data.companyDetails.users?.length || 0,
        users:
          data.companyDetails.users?.map((user: any) => ({
            id: user.id,
            name: user.name,
            rolesCount: user.userRoles?.length || 0,
            roles: user.userRoles?.map((ur: any) => ur.role?.name) || [],
          })) || [],
      })

      return data.companyDetails as Company
    } catch (error) {
      console.error('Get company with users details error:', error)
      throw error
    }
  }
}
