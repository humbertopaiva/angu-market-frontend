import { Navigate, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'
import { DashboardView } from '@/features/dashboard/view/dashboard-view'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  // Se não estiver logado, redireciona para login
  const hasToken = tokenStorage.hasToken()

  if (!hasToken) {
    return <Navigate to="/auth/login" />
  }

  return <DashboardView />
}
