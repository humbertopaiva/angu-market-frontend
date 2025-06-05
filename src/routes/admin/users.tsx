import { Navigate, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { UsersView } from '@/features/admin/view/users-view'
import { canManageUsers } from '@/utils/role-helpers'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
  beforeLoad: ({ location }) => {
    // Verificar se tem token
    if (!tokenStorage.hasToken()) {
      throw new Error('Não autenticado')
    }
  },
})

function AdminUsersPage() {
  const { user, isLoading } = useAuthStore()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não tem usuário carregado, redireciona para login
  if (!user) {
    return <Navigate to="/auth/login" />
  }

  // CORREÇÃO: Verificar se pode gerenciar usuários (incluindo place admin)
  if (!canManageUsers(user)) {
    return <Navigate to="/dashboard" />
  }

  return <UsersView />
}
