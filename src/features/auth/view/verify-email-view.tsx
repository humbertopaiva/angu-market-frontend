import { useNavigate, useSearch } from '@tanstack/react-router'
import { VerifyEmailForm } from '../components/verify-email-form'
import { useAuthViewModel } from '../viewmodel/auth-viewmodel'
import { useAuthStore } from '../stores/auth-store'
import type { ResendVerificationInput, VerifyEmailInput } from '@/types/graphql'

interface VerifyEmailViewProps {
  token?: string
}

export function VerifyEmailView({ token }: VerifyEmailViewProps) {
  const navigate = useNavigate()
  const authViewModel = useAuthViewModel()
  const { isLoading } = useAuthStore()

  // Pegar email da query string se disponível
  const search = useSearch({ from: '/auth/verify-email' })
  const email = search.email

  const handleVerify = async (data: VerifyEmailInput) => {
    await authViewModel.verifyEmail(data)
  }

  const handleResendEmail = async (data: ResendVerificationInput) => {
    await authViewModel.resendVerificationEmail(data)
  }

  const handleBackToLogin = () => {
    navigate({ to: '/auth/login' })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Angu Market</h1>
        <p className="text-gray-600">Verificação de email</p>
      </div>

      <VerifyEmailForm
        onVerify={handleVerify}
        onResendEmail={handleResendEmail}
        onBackToLogin={handleBackToLogin}
        isLoading={isLoading}
        email={email}
        token={token}
      />
    </div>
  )
}
