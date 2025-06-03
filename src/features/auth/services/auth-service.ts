import {
  LOGIN_MUTATION,
  ME_QUERY,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
} from './auth-queries'
import type {
  AuthResponse,
  LoginInput,
  RequestPasswordResetInput,
  RequestPasswordResetResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
  User,
} from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'
import { tokenStorage } from '@/infra/storage/token-storage'

export class AuthService {
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { loginInput: input },
      })

      const authResponse = data.login as AuthResponse

      // Salvar token no storage
      tokenStorage.setToken(authResponse.accessToken)

      return authResponse
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async requestPasswordReset(
    input: RequestPasswordResetInput,
  ): Promise<RequestPasswordResetResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REQUEST_PASSWORD_RESET_MUTATION,
        variables: { requestPasswordResetInput: input },
      })

      return data.requestPasswordReset as RequestPasswordResetResponse
    } catch (error) {
      console.error('Request password reset error:', error)
      throw error
    }
  }

  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<ResetPasswordResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: RESET_PASSWORD_MUTATION,
        variables: { resetPasswordInput: input },
      })

      return data.resetPassword as ResetPasswordResponse
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const { data } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })

      return data.me as User
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      // Limpar token do storage
      tokenStorage.removeToken()

      // Limpar cache do Apollo
      await apolloClient.clearStore()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return tokenStorage.hasToken()
  }
}
