// src/routes/company/dashboard.tsx
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'
import { CompanyDashboardView } from '@/features/company/view/company-dashboard-view'

export const Route = createFileRoute('/auth/company/dashboard')({
  component: CompanyDashboard,
})

function CompanyDashboard() {
  // Se não estiver logado, redireciona para company login
  const hasToken = tokenStorage.hasToken()

  if (!hasToken) {
    return <Navigate to="/auth/company-login" />
  }

  return <CompanyDashboardView />
}
