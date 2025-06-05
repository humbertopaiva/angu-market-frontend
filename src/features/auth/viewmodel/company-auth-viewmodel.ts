import { useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { CompanyAuthService } from '../services/company-auth-service'
import { useAuthStore } from '../stores/auth-store'
import type { CompanyLoginInput } from '@/types/graphql'

export class CompanyAuthViewModel {
  private companyAuthService: CompanyAuthService
  private setUser: (user: any) => void
  private setLoading: (loading: boolean) => void
  private navigate: ReturnType<typeof useNavigate>

  constructor(
    companyAuthService: CompanyAuthService,
    setUser: (user: any) => void,
    setLoading: (loading: boolean) => void,
    navigate: ReturnType<typeof useNavigate>,
  ) {
    this.companyAuthService = companyAuthService
    this.setUser = setUser
    this.setLoading = setLoading
    this.navigate = navigate
  }

  async login(input: CompanyLoginInput): Promise<boolean> {
    try {
      this.setLoading(true)

      // Validar entrada
      const validationErrors =
        this.companyAuthService.validateCompanyLogin(input)
      if (validationErrors.length > 0) {
        toast.error('Erro de validação', {
          description: validationErrors.join(', '),
        })
        return false
      }

      // Realizar login
      const response = await this.companyAuthService.companyLogin(input)

      // Armazenar dados do usuário
      this.setUser(response.user)

      // Mostrar sucesso
      toast.success('Login realizado com sucesso!', {
        description: `Bem-vindo à ${response.company.name}`,
      })

      // Redirecionar para dashboard da empresa
      this.navigate({ to: '/auth/company/dashboard' })

      return true
    } catch (error: any) {
      console.error('Company login error:', error)

      let errorMessage = 'Erro interno do servidor'

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message
      } else if (error?.networkError?.message) {
        errorMessage = 'Erro de conexão com o servidor'
      }

      toast.error('Erro no login', {
        description: errorMessage,
      })

      return false
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
        description: 'Você foi desconectado da empresa.',
      })
    } catch (error) {
      console.error('Company logout error:', error)
    }
  }

  formatCompanySlug(slug: string): string {
    return this.companyAuthService.formatCompanySlug(slug)
  }

  extractSlugFromUrl(): string | null {
    return this.companyAuthService.extractSlugFromUrl()
  }
}

export function useCompanyAuthViewModel() {
  const { setUser, setLoading } = useAuthStore()
  const navigate = useNavigate()
  const companyAuthService = new CompanyAuthService()

  const viewModel = new CompanyAuthViewModel(
    companyAuthService,
    setUser,
    setLoading,
    navigate,
  )

  return viewModel
}
