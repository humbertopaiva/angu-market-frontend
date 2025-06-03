import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailView } from '@/features/auth/view/verify-email-view'

export const Route = createFileRoute('/auth/verify-email/$token')({
  component: VerifyEmailWithToken,
})

function VerifyEmailWithToken() {
  const { token } = Route.useParams()

  return <VerifyEmailView token={token} />
}
