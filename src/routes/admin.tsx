import { Navigate, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { AdminDashboardView } from '@/features/admin/view/admin-dashboard-view'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = useAuthStore()
  const hasToken = tokenStorage.hasToken()

  // Se não estiver logado, redireciona para login
  if (!hasToken) {
    return <Navigate to="/auth/login" />
  }

  // Se não tiver usuário carregado ainda, aguarda
  if (!user) {
    return <div>Carregando...</div>
  }

  // Verifica se é super admin
  const isSuperAdmin = user.userRoles?.some(
    (role) => role.role.name === 'SUPER_ADMIN',
  )

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" />
  }

  return <AdminDashboardView />
}
