import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { AuthService } from '../services/auth-service'
import { useAuthStore } from '../stores/auth-store'
import type {
  LoginInput,
  RequestPasswordResetInput,
  ResendVerificationInput,
  ResetPasswordInput,
  SignUpInput,
  VerifyEmailInput,
} from '@/types/graphql'

export class AuthViewModel {
  private authService: AuthService
  private navigate: ReturnType<typeof useNavigate>
  private setUser: (user: any) => void
  private setLoading: (loading: boolean) => void

  constructor(
    authService: AuthService,
    navigate: ReturnType<typeof useNavigate>,
    setUser: (user: any) => void,
    setLoading: (loading: boolean) => void,
  ) {
    this.authService = authService
    this.navigate = navigate
    this.setUser = setUser
    this.setLoading = setLoading
  }

  async login(input: LoginInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.authService.login(input)

      this.setUser(response.user)

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo de volta, ${response.user.name}!`,
      })

      this.navigate({ to: '/dashboard' })
    } catch (error: any) {
      console.error('Login error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      } else if (error?.networkError?.message) {
        errorMessage = 'Erro de conexão com o servidor'
      }

      toast.error('Erro no login', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async signUp(input: SignUpInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.authService.signUp(input)

      toast.success('Conta criada com sucesso!', {
        description: response.message,
      })

      // Redirecionar para página de verificação de email
      this.navigate({
        to: '/auth/verify-email',
        search: { email: input.email },
      })
    } catch (error: any) {
      console.error('Sign up error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      } else if (error?.networkError?.message) {
        errorMessage = 'Erro de conexão com o servidor'
      }

      toast.error('Erro ao criar conta', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async verifyEmail(input: VerifyEmailInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.authService.verifyEmail(input)

      toast.success('Email verificado com sucesso!', {
        description: response.message,
      })

      this.navigate({ to: '/auth/login' })
    } catch (error: any) {
      console.error('Verify email error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      }

      toast.error('Erro ao verificar email', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async resendVerificationEmail(input: ResendVerificationInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.authService.resendVerificationEmail(input)

      toast.success('Email reenviado!', {
        description: response.message,
      })
    } catch (error: any) {
      console.error('Resend verification email error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      }

      toast.error('Erro ao reenviar email', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.authService.requestPasswordReset(input)

      toast.success('Solicitação enviada!', {
        description: response.message,
      })
    } catch (error: any) {
      console.error('Request password reset error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      }

      toast.error('Erro na solicitação', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.authService.resetPassword(input)

      toast.success('Senha redefinida!', {
        description: response.message,
      })

      this.navigate({ to: '/auth/login' })
    } catch (error: any) {
      console.error('Reset password error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      }

      toast.error('Erro ao redefinir senha', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout()
      this.setUser(null)
      this.navigate({ to: '/auth/login' })

      toast.success('Logout realizado', {
        description: 'Você foi desconectado com sucesso.',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}

export function useAuthViewModel() {
  const navigate = useNavigate()
  const { setUser, setLoading } = useAuthStore()
  const authService = new AuthService()

  return new AuthViewModel(authService, navigate, setUser, setLoading)
}
