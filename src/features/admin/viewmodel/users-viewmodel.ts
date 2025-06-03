import { useState } from 'react'
import { toast } from 'sonner'
import { UsersService } from '../services/users-service'
import type {
  CreateUserInput,
  UpdateUserInput,
} from '../services/users-service'
import type { User } from '@/types/graphql'

export class UsersViewModel {
  private usersService: UsersService
  private setLoading: (loading: boolean) => void
  private setUsers: (users: Array<User>) => void
  private users: Array<User>

  constructor(
    usersService: UsersService,
    setLoading: (loading: boolean) => void,
    setUsers: (users: Array<User>) => void,
    users: Array<User>,
  ) {
    this.usersService = usersService
    this.setLoading = setLoading
    this.setUsers = setUsers
    this.users = users
  }

  async loadUsers(): Promise<void> {
    try {
      this.setLoading(true)
      const users = await this.usersService.getUsers()
      this.setUsers(users)
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Erro ao carregar usuários', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadUsersByPlace(placeId: number): Promise<void> {
    try {
      this.setLoading(true)
      const users = await this.usersService.getUsersByPlace(placeId)
      this.setUsers(users)
    } catch (error: any) {
      console.error('Error loading users by place:', error)
      toast.error('Erro ao carregar usuários do place', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async createUser(input: CreateUserInput): Promise<void> {
    try {
      this.setLoading(true)
      const newUser = await this.usersService.createUser(input)
      this.setUsers([...this.users, newUser])

      toast.success('Usuário criado com sucesso!', {
        description: `${newUser.name} foi adicionado.`,
      })
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error('Erro ao criar usuário', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async updateUser(input: UpdateUserInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedUser = await this.usersService.updateUser(input)
      const updatedUsers = this.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      )
      this.setUsers(updatedUsers)

      toast.success('Usuário atualizado com sucesso!', {
        description: `${updatedUser.name} foi atualizado.`,
      })
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error('Erro ao atualizar usuário', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async deleteUser(id: number, name: string): Promise<void> {
    try {
      this.setLoading(true)
      await this.usersService.deleteUser(id)
      const filteredUsers = this.users.filter((user) => Number(user.id) !== id)
      this.setUsers(filteredUsers)

      toast.success('Usuário removido com sucesso!', {
        description: `${name} foi removido.`,
      })
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Erro ao remover usuário', {
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

export function useUsersViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<Array<User>>([])
  const usersService = new UsersService()

  const viewModel = new UsersViewModel(
    usersService,
    setIsLoading,
    setUsers,
    users,
  )

  return {
    viewModel,
    isLoading,
    users,
  }
}
