import { useAuthViewModel } from '../viewmodel/auth-viewmodel'
import { useAuthStore } from '../stores/auth-store'
import { ResetPasswordForm } from '../components/reset-password'

interface ResetPasswordViewProps {
  token: string
}

export function ResetPasswordView({ token }: ResetPasswordViewProps) {
  const authViewModel = useAuthViewModel()
  const { isLoading } = useAuthStore()

  const handleSubmit = async (data: { newPassword: string }) => {
    await authViewModel.resetPassword({
      token,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Angu Market</h1>
        <p className="text-gray-600">Definir nova senha</p>
      </div>

      <ResetPasswordForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        token={token}
      />
    </div>
  )
}
