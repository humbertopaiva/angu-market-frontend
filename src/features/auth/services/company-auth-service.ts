import { COMPANY_LOGIN_MUTATION } from './company-auth-queries'
import type { CompanyAuthResponse, CompanyLoginInput } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'
import { tokenStorage } from '@/infra/storage/token-storage'

export class CompanyAuthService {
  /**
   * Login de empresa
   */
  async companyLogin(input: CompanyLoginInput): Promise<CompanyAuthResponse> {
    try {
      console.log('Company login attempt:', {
        companySlug: input.companySlug,
        email: input.email,
      })

      const { data } = await apolloClient.mutate({
        mutation: COMPANY_LOGIN_MUTATION,
        variables: { companyLoginInput: input },
      })

      const response = data.companyLogin as CompanyAuthResponse

      // Armazenar token
      tokenStorage.setToken(response.accessToken)

      return response
    } catch (error) {
      console.error('Company login error:', error)
      throw error
    }
  }

  /**
   * Logout de empresa
   */
  async logout(): Promise<void> {
    try {
      // Limpar token
      tokenStorage.removeToken()

      // Limpar cache do Apollo
      await apolloClient.clearStore()
    } catch (error) {
      console.error('Company logout error:', error)
      throw error
    }
  }

  /**
   * Verificar se é login de empresa
   */
  isCompanyLogin(): boolean {
    // Você pode implementar lógica para detectar se o login atual é de empresa
    // Por exemplo, verificando uma flag no localStorage ou no token
    return (
      window.location.pathname.includes('/company') ||
      window.location.pathname.includes('/auth/company')
    )
  }

  /**
   * Validar entrada de login de empresa
   */
  validateCompanyLogin(input: CompanyLoginInput): Array<string> {
    const errors: Array<string> = []

    if (!input.companySlug || input.companySlug.trim().length === 0) {
      errors.push('Slug da empresa é obrigatório')
    }

    if (!input.email || input.email.trim().length === 0) {
      errors.push('Email é obrigatório')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.push('Email deve ser válido')
    }

    if (!input.password || input.password.length === 0) {
      errors.push('Senha é obrigatória')
    }

    return errors
  }

  /**
   * Formatar slug de empresa
   */
  formatCompanySlug(slug: string): string {
    return slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
  }

  /**
   * Extrair slug da URL (se aplicável)
   */
  extractSlugFromUrl(): string | null {
    const path = window.location.pathname
    const matches = path.match(/\/company\/([^/]+)/)
    return matches ? matches[1] : null
  }
}
