import { createFileRoute } from '@tanstack/react-router'
import { SignUpView } from '@/features/auth/view/signup-view'

export const Route = createFileRoute('/auth/signup')({
  component: SignUpView,
})
