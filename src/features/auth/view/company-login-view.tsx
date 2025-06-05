// src/features/auth/view/company-login-view.tsx
import { useNavigate } from '@tanstack/react-router'
import { CompanyLoginForm } from '../components/company-login-form'

import { useAuthStore } from '../stores/auth-store'
import { useCompanyAuthViewModel } from '../viewmodel/company-auth-viewmodel'
import type { CompanyLoginInput } from '@/types/graphql'

export function CompanyLoginView() {
  const navigate = useNavigate()
  const companyAuthViewModel = useCompanyAuthViewModel()
  const { isLoading } = useAuthStore()

  const handleCompanyLogin = async (data: CompanyLoginInput) => {
    await companyAuthViewModel.companyLogin(data)
  }

  const handleBackToMainLogin = () => {
    navigate({ to: '/auth/login' })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Angu Market</h1>
        <p className="text-gray-600">Acesso dedicado para empresas parceiras</p>
      </div>

      <CompanyLoginForm
        onSubmit={handleCompanyLogin}
        isLoading={isLoading}
        onBackToMainLogin={handleBackToMainLogin}
      />
    </div>
  )
}
