import { gql } from '@apollo/client'

import type { User } from '../model/auth.model'
import { apolloClient } from '@/core/lib/apollo'

interface AuthPayload {
  token: string
  user: User
}

interface RequestPasswordResetResponse {
  success: boolean
  message: string
}

interface ResetPasswordResponse {
  success: boolean
  message: string
}

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const ME = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`

const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`

const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`

class AuthService {
  async login(email: string, password: string): Promise<AuthPayload> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN,
        variables: {
          input: { email, password },
        },
      })

      return data.login
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(
        'Falha ao fazer login. Verifique suas credenciais e tente novamente.',
      )
    }
  }

  async signup(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<AuthPayload> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SIGN_UP,
        variables: {
          input: { name, email, password, passwordConfirmation },
        },
      })

      return data.signUp
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error(
        'Falha ao criar conta. Verifique se o email já está em uso ou tente novamente mais tarde.',
      )
    }
  }

  async me(): Promise<User | null> {
    try {
      const { data } = await apolloClient.query({
        query: ME,
        fetchPolicy: 'network-only',
      })

      return data.me
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  }

  async requestPasswordReset(
    email: string,
  ): Promise<RequestPasswordResetResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REQUEST_PASSWORD_RESET,
        variables: {
          input: { email },
        },
      })
      return data.requestPasswordReset
    } catch (error) {
      console.error('Error requesting password reset:', error)
      return {
        success: false,
        message:
          'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
      }
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ResetPasswordResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: RESET_PASSWORD,
        variables: {
          input: { token, newPassword },
        },
      })
      return data.resetPassword
    } catch (error) {
      console.error('Error resetting password:', error)
      return {
        success: false,
        message:
          'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
      }
    }
  }

  storeToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  removeToken(): void {
    localStorage.removeItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
