// src/features/auth/viewmodel/company-auth-viewmodel.ts
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CompanyAuthService } from '../services/company-auth-service'
import { useAuthStore } from '../stores/auth-store'
import type { CompanyLoginInput } from '@/types/graphql'

export class CompanyAuthViewModel {
  private companyAuthService: CompanyAuthService
  private navigate: ReturnType<typeof useNavigate>
  private setUser: (user: any) => void
  private setLoading: (loading: boolean) => void

  constructor(
    companyAuthService: CompanyAuthService,
    navigate: ReturnType<typeof useNavigate>,
    setUser: (user: any) => void,
    setLoading: (loading: boolean) => void,
  ) {
    this.companyAuthService = companyAuthService
    this.navigate = navigate
    this.setUser = setUser
    this.setLoading = setLoading
  }

  async companyLogin(input: CompanyLoginInput): Promise<void> {
    try {
      this.setLoading(true)

      const response = await this.companyAuthService.companyLogin(input)

      this.setUser(response.user)

      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo à ${response.company.name}, ${response.user.name}!`,
      })

      // Redirecionar para dashboard da empresa
      this.navigate({ to: '/company/dashboard' })
    } catch (error: any) {
      console.error('Company login error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      } else if (error?.networkError?.message) {
        errorMessage = 'Erro de conexão com o servidor'
      }

      toast.error('Erro no login empresarial', {
        description: errorMessage,
      })
    } finally {
      this.setLoading(false)
    }
  }

  async logout(): Promise<void> {
    try {
      await this.companyAuthService.logout()
      this.setUser(null)
      this.navigate({ to: '/auth/company-login' })

      toast.success('Logout realizado', {
        description: 'Você foi desconectado com sucesso.',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
}

export function useCompanyAuthViewModel() {
  const navigate = useNavigate()
  const { setUser, setLoading } = useAuthStore()
  const companyAuthService = new CompanyAuthService()

  return new CompanyAuthViewModel(
    companyAuthService,
    navigate,
    setUser,
    setLoading,
  )
}
