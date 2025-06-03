import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { AdminDashboardView } from '@/features/admin/view/admin-dashboard-view'
import { isSuperAdmin } from '@/utils/role-helpers'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
  beforeLoad: ({ location }) => {
    // Verificar se tem token
    if (!tokenStorage.hasToken()) {
      throw new Error('Não autenticado')
    }
  },
})

function AdminLayout() {
  const { user, isLoading } = useAuthStore()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Carregando Painel Administrativo
          </h2>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Se não tem usuário carregado, redireciona para login
  if (!user) {
    return <Navigate to="/auth/login" />
  }

  // Verificar se é super admin
  if (!isSuperAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar o painel administrativo. Apenas
            Super Administradores podem acessar esta área.
          </p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboardView />
}
