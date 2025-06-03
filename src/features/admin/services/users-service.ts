import {
  CREATE_USER_MUTATION,
  DELETE_USER_MUTATION,
  GET_USERS_BY_PLACE_QUERY,
  GET_USERS_QUERY,
  GET_USER_BY_ID_QUERY,
  UPDATE_USER_MUTATION,
} from './users-queries'
import type { User } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export interface CreateUserInput {
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  organizationId?: number
  placeId?: number
  companyId?: number
  roleIds?: Array<number>
  isActive?: boolean
}

export interface UpdateUserInput {
  id: number
  name?: string
  phone?: string
  avatar?: string
  organizationId?: number
  placeId?: number
  companyId?: number
  roleIds?: Array<number>
  isActive?: boolean
}

export class UsersService {
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_USER_MUTATION,
        variables: { createUserInput: input },
        refetchQueries: [{ query: GET_USERS_QUERY }],
      })

      return data.createUser as User
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  async updateUser(input: UpdateUserInput): Promise<User> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { updateUserInput: input },
        refetchQueries: [{ query: GET_USERS_QUERY }],
      })

      return data.updateUser as User
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_USERS_QUERY }],
      })
    } catch (error) {
      console.error('Delete user error:', error)
      throw error
    }
  }

  async getUsers(): Promise<Array<User>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_USERS_QUERY,
        fetchPolicy: 'cache-first',
      })

      return data.users.edges.map((edge: any) => edge.node) as Array<User>
    } catch (error) {
      console.error('Get users error:', error)
      throw error
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const { data } = await apolloClient.query({
        query: GET_USER_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.user as User
    } catch (error) {
      console.error('Get user by id error:', error)
      throw error
    }
  }

  async getUsersByPlace(placeId: number): Promise<Array<User>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_USERS_BY_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.usersByPlace as Array<User>
    } catch (error) {
      console.error('Get users by place error:', error)
      throw error
    }
  }
}
