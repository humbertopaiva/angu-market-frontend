import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordView } from '@/features/auth/view/reset-password-view'

export const Route = createFileRoute('/auth/reset-passoword/$token')({
  component: ResetPassword,
})

function ResetPassword() {
  const { token } = Route.useParams()

  return <ResetPasswordView token={token} />
}
