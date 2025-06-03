import { useNavigate } from '@tanstack/react-router'

import { useAuthViewModel } from '../viewmodel/auth-viewmodel'
import { useAuthStore } from '../stores/auth-store'
import { ForgotPasswordForm } from '../components/forgot-password'
import type { RequestPasswordResetInput } from '@/types/graphql'

export function ForgotPasswordView() {
  const navigate = useNavigate()
  const authViewModel = useAuthViewModel()
  const { isLoading } = useAuthStore()

  const handleSubmit = async (data: RequestPasswordResetInput) => {
    await authViewModel.requestPasswordReset(data)
  }

  const handleBackToLogin = () => {
    navigate({ to: '/auth/login' })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Angu Market</h1>
        <p className="text-gray-600">Recuperação de senha</p>
      </div>

      <ForgotPasswordForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  )
}
