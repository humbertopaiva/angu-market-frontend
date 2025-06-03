import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '@/features/auth/view/login-view'

export const Route = createFileRoute('/auth/login')({
  component: LoginView,
})
