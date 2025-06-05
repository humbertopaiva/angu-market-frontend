// src/features/auth/services/company-auth-service.ts
import { COMPANY_LOGIN_MUTATION } from './company-auth-queries'
import type { CompanyAuthResponse, CompanyLoginInput } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'
import { tokenStorage } from '@/infra/storage/token-storage'

export class CompanyAuthService {
  async companyLogin(input: CompanyLoginInput): Promise<CompanyAuthResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: COMPANY_LOGIN_MUTATION,
        variables: { companyLoginInput: input },
      })

      const authResponse = data.companyLogin as CompanyAuthResponse

      // Salvar token no storage
      tokenStorage.setToken(authResponse.accessToken)

      return authResponse
    } catch (error) {
      console.error('Company login error:', error)
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
}
