import { useState } from 'react'
import { toast } from 'sonner'

import { CompanyAdminService } from '../services/company-admin-service'
import type {
  AssignCompanyAdminInput,
  RemoveCompanyAdminInput,
} from '../services/company-admin-service'
import type { Company, User } from '@/types/graphql'

export class CompanyAdminViewModel {
  private companyAdminService: CompanyAdminService
  private setLoading: (loading: boolean) => void
  private setAvailableUsers: (users: Array<User>) => void
  private availableUsers: Array<User>

  constructor(
    companyAdminService: CompanyAdminService,
    setLoading: (loading: boolean) => void,
    setAvailableUsers: (users: Array<User>) => void,
    availableUsers: Array<User>,
  ) {
    this.companyAdminService = companyAdminService
    this.setLoading = setLoading
    this.setAvailableUsers = setAvailableUsers
    this.availableUsers = availableUsers
  }

  async loadAvailableUsers(placeId: number): Promise<void> {
    try {
      this.setLoading(true)
      const users =
        await this.companyAdminService.getAvailableCompanyAdmins(placeId)
      this.setAvailableUsers(users)
    } catch (error: any) {
      console.error('Error loading available users:', error)
      toast.error('Erro ao carregar usuários disponíveis', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async assignCompanyAdmin(
    input: AssignCompanyAdminInput,
  ): Promise<Company | null> {
    try {
      this.setLoading(true)

      // Buscar dados do usuário para validação
      const user = this.availableUsers.find(
        (u) => Number(u.id) === input.userId,
      )

      if (user) {
        const validation = this.companyAdminService.validateAssignAdmin(
          user,
          {} as Company,
        )
        if (validation.length > 0) {
          toast.error('Erro de validação', {
            description: validation.join(', '),
          })
          return null
        }
      }

      const updatedCompany =
        await this.companyAdminService.assignCompanyAdmin(input)

      // Atualizar lista de usuários disponíveis
      if (user) {
        const updatedUsers = this.availableUsers.map((u) =>
          Number(u.id) === input.userId
            ? { ...u, companyId: input.companyId }
            : u,
        )
        this.setAvailableUsers(updatedUsers)
      }

      toast.success('Admin atribuído com sucesso!', {
        description: `${user?.name || 'Usuário'} agora é admin da empresa.`,
      })

      return updatedCompany
    } catch (error: any) {
      console.error('Error assigning company admin:', error)
      toast.error('Erro ao atribuir admin', {
        description: this.getErrorMessage(error),
      })
      return null
    } finally {
      this.setLoading(false)
    }
  }

  async removeCompanyAdmin(
    input: RemoveCompanyAdminInput,
  ): Promise<Company | null> {
    try {
      this.setLoading(true)

      const user = this.availableUsers.find(
        (u) => Number(u.id) === input.userId,
      )

      const updatedCompany =
        await this.companyAdminService.removeCompanyAdmin(input)

      // Atualizar lista de usuários disponíveis
      if (user) {
        const updatedUsers = this.availableUsers.map((u) =>
          Number(u.id) === input.userId
            ? { ...u, companyId: undefined, company: undefined }
            : u,
        )
        this.setAvailableUsers(updatedUsers)
      }

      toast.success('Admin removido com sucesso!', {
        description: `${user?.name || 'Usuário'} não é mais admin da empresa.`,
      })

      return updatedCompany
    } catch (error: any) {
      console.error('Error removing company admin:', error)
      toast.error('Erro ao remover admin', {
        description: this.getErrorMessage(error),
      })
      return null
    } finally {
      this.setLoading(false)
    }
  }

  getUserStatus(user: User): {
    label: string
    color: string
    canBeAdmin: boolean
    currentCompany?: string
  } {
    return this.companyAdminService.formatUserStatus(user)
  }

  canUserBeAdmin(user: User): boolean {
    return this.companyAdminService.canBeCompanyAdmin(user)
  }

  isUserCompanyAdmin(user: User): boolean {
    return this.companyAdminService.isCompanyAdmin(user)
  }

  getCompanyAdmins(company: Company): Array<User> {
    return this.companyAdminService.getCompanyAdmins(company)
  }

  getCompanyStaff(company: Company): Array<User> {
    return this.companyAdminService.getCompanyStaff(company)
  }

  filterAvailableUsers(searchTerm: string): Array<User> {
    if (!searchTerm) return this.availableUsers

    const term = searchTerm.toLowerCase()
    return this.availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.company?.name && user.company.name.toLowerCase().includes(term)),
    )
  }

  groupUsersByStatus(): Record<string, Array<User>> {
    const groups: Record<string, Array<User>> = {
      available: [],
      companyAdmin: [],
      companyStaff: [],
      notAvailable: [],
    }

    this.availableUsers.forEach((user) => {
      const status = this.getUserStatus(user)

      if (!status.canBeAdmin) {
        groups.notAvailable.push(user)
      } else if (this.isUserCompanyAdmin(user)) {
        groups.companyAdmin.push(user)
      } else if (user.companyId) {
        groups.companyStaff.push(user)
      } else {
        groups.available.push(user)
      }
    })

    return groups
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

export function useCompanyAdminViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Array<User>>([])
  const companyAdminService = new CompanyAdminService()

  const viewModel = new CompanyAdminViewModel(
    companyAdminService,
    setIsLoading,
    setAvailableUsers,
    availableUsers,
  )

  return {
    viewModel,
    isLoading,
    availableUsers,
  }
}
