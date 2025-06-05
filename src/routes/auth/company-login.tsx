// src/routes/auth/company-login.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CompanyLoginView } from '@/features/auth/view/company-login-view'

export const Route = createFileRoute('/auth/company-login')({
  component: CompanyLoginView,
})
