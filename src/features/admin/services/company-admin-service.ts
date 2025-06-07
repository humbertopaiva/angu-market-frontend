import {
  ASSIGN_COMPANY_ADMIN_MUTATION,
  GET_AVAILABLE_COMPANY_ADMINS_QUERY,
  REMOVE_COMPANY_ADMIN_MUTATION,
} from './company-admin-queries'
import {
  GET_COMPANIES_QUERY,
  GET_COMPANY_WITH_USERS_QUERY,
} from './companies-queries'
import type { Company, User } from '@/types/graphql'
import { RoleType } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export interface AssignCompanyAdminInput {
  companyId: number
  userId: number
}

export interface RemoveCompanyAdminInput {
  companyId: number
  userId: number
}

export class CompanyAdminService {
  /**
   * Atribuir usuário como admin de empresa
   */
  async assignCompanyAdmin(input: AssignCompanyAdminInput): Promise<Company> {
    try {
      console.log('Assigning company admin:', input)

      const { data } = await apolloClient.mutate({
        mutation: ASSIGN_COMPANY_ADMIN_MUTATION,
        variables: {
          companyId: input.companyId,
          userId: input.userId,
        },
        refetchQueries: [
          { query: GET_COMPANIES_QUERY },
          {
            query: GET_AVAILABLE_COMPANY_ADMINS_QUERY,
            variables: { placeId: null }, // Será atualizado pelo component
          },
        ],
      })

      return data.assignCompanyAdmin as Company
    } catch (error) {
      console.error('Assign company admin error:', error)
      throw error
    }
  }

  /**
   * Remover usuário como admin de empresa
   */
  async removeCompanyAdmin(input: RemoveCompanyAdminInput): Promise<Company> {
    try {
      console.log('Removing company admin:', input)

      const { data } = await apolloClient.mutate({
        mutation: REMOVE_COMPANY_ADMIN_MUTATION,
        variables: {
          companyId: input.companyId,
          userId: input.userId,
        },
        refetchQueries: [
          { query: GET_COMPANIES_QUERY },
          {
            query: GET_AVAILABLE_COMPANY_ADMINS_QUERY,
            variables: { placeId: null }, // Será atualizado pelo component
          },
        ],
      })

      return data.removeCompanyAdmin as Company
    } catch (error) {
      console.error('Remove company admin error:', error)
      throw error
    }
  }

  /**
   * Buscar usuários disponíveis para serem admin de empresa
   */
  async getAvailableCompanyAdmins(placeId: number): Promise<Array<User>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_AVAILABLE_COMPANY_ADMINS_QUERY,
        variables: { placeId },
        fetchPolicy: 'network-only', // Sempre buscar dados frescos
      })

      return data.availableCompanyAdmins as Array<User>
    } catch (error) {
      console.error('Get available company admins error:', error)
      throw error
    }
  }

  /**
   * Verificar se usuário pode ser admin de empresa
   */
  canBeCompanyAdmin(user: User): boolean {
    const userRoles = user.userRoles?.map((ur) => ur.role.name) || []

    // Não pode ser super admin ou place admin
    if (
      userRoles.includes(RoleType.SUPER_ADMIN) ||
      userRoles.includes(RoleType.PLACE_ADMIN)
    ) {
      return false
    }

    return true
  }

  /**
   * Verificar se usuário já é admin de alguma empresa
   */
  isCompanyAdmin(user: User): boolean {
    if (!user.userRoles || user.userRoles.length === 0) {
      console.debug('User has no roles:', user.name, user.id)
      return false
    }

    const userRoles = user.userRoles.map((ur) => ur.role.name)
    console.debug('User roles for', user.name, ':', userRoles)

    const isAdmin = userRoles.includes(RoleType.COMPANY_ADMIN)
    console.debug('Is company admin:', isAdmin)

    return isAdmin
  }

  /**
   * Obter empresa do usuário (se for admin)
   */
  getUserCompany(user: User): Company | null {
    if (this.isCompanyAdmin(user) && user.company) {
      return user.company
    }
    return null
  }

  /**
   * Formatar status do usuário para exibição
   */
  formatUserStatus(user: User): {
    label: string
    color: string
    canBeAdmin: boolean
    currentCompany?: string
  } {
    console.debug('=== FORMAT USER STATUS DEBUG ===')
    console.debug('User:', user.name, 'ID:', user.id)
    console.debug('User roles count:', user.userRoles?.length || 0)

    if (!user.userRoles || user.userRoles.length === 0) {
      console.debug('User has no roles, defaulting to public user')
      return {
        label: 'Sem função definida',
        color: 'gray',
        canBeAdmin: true,
      }
    }

    const userRoles = user.userRoles.map((ur) => {
      console.debug('Role object:', ur.role)
      return ur.role.name
    })

    console.debug('User roles:', userRoles)

    if (userRoles.includes(RoleType.SUPER_ADMIN)) {
      return {
        label: 'Super Admin',
        color: 'red',
        canBeAdmin: false,
      }
    }

    if (userRoles.includes(RoleType.PLACE_ADMIN)) {
      return {
        label: 'Admin do Place',
        color: 'purple',
        canBeAdmin: false,
      }
    }

    if (userRoles.includes(RoleType.COMPANY_ADMIN)) {
      return {
        label: 'Admin de Empresa',
        color: 'blue',
        canBeAdmin: true,
        currentCompany: user.company?.name || 'Empresa não encontrada',
      }
    }

    if (userRoles.includes(RoleType.COMPANY_STAFF)) {
      return {
        label: 'Funcionário',
        color: 'green',
        canBeAdmin: true,
        currentCompany: user.company?.name || 'Empresa não encontrada',
      }
    }

    return {
      label: 'Usuário Público',
      color: 'gray',
      canBeAdmin: true,
    }
  }

  /**
   * Buscar admins atuais de uma empresa
   */
  getCompanyAdmins(company: Company): Array<User> {
    console.debug('=== GET COMPANY ADMINS DEBUG START ===')
    console.debug('Company:', company.name, 'ID:', company.id)
    console.debug('Company users count:', company.users?.length || 0)

    if (!company.users || company.users.length === 0) {
      console.debug('No users found for company')
      return []
    }

    const admins = company.users.filter((user) => {
      console.debug('Checking user:', user.name, 'ID:', user.id)
      console.debug('User roles count:', user.userRoles?.length || 0)

      if (!user.userRoles || user.userRoles.length === 0) {
        console.debug('User has no roles')
        return false
      }

      const userRoles = user.userRoles.map((ur) => {
        console.debug('Role:', ur.role.name)
        return ur.role.name
      })

      console.debug('User roles:', userRoles)

      const isAdmin = userRoles.includes(RoleType.COMPANY_ADMIN)
      console.debug('Is admin:', isAdmin)

      return isAdmin
    })

    console.debug(
      'Found admins:',
      admins.map((a) => ({ name: a.name, id: a.id })),
    )
    console.debug('=== GET COMPANY ADMINS DEBUG END ===')

    return admins
  }

  /**
   * Buscar funcionários de uma empresa
   */
  getCompanyStaff(company: Company): Array<User> {
    console.debug('=== GET COMPANY STAFF DEBUG START ===')
    console.debug('Company:', company.name)

    if (!company.users || company.users.length === 0) {
      console.debug('No users found for company staff')
      return []
    }

    const staff = company.users.filter((user) => {
      if (!user.userRoles || user.userRoles.length === 0) {
        return false
      }

      const userRoles = user.userRoles.map((ur) => ur.role.name)
      const isStaff = userRoles.includes(RoleType.COMPANY_STAFF)

      console.debug(
        'User:',
        user.name,
        'roles:',
        userRoles,
        'isStaff:',
        isStaff,
      )

      return isStaff
    })

    console.debug(
      'Found staff:',
      staff.map((s) => ({ name: s.name, id: s.id })),
    )
    console.debug('=== GET COMPANY STAFF DEBUG END ===')

    return staff
  }

  /**
   * Validar se pode atribuir admin
   */
  validateAssignAdmin(user: User, company: Company): Array<string> {
    const errors: Array<string> = []

    if (!this.canBeCompanyAdmin(user)) {
      errors.push('Este usuário não pode ser admin de empresa')
    }

    if (!user.isActive) {
      errors.push('Usuário deve estar ativo')
    }

    if (!user.isVerified) {
      errors.push('Usuário deve estar verificado')
    }

    if (user.placeId !== company.placeId) {
      errors.push('Usuário deve ser do mesmo place da empresa')
    }

    return errors
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
