// src/routes/admin/segmentation.tsx
import { Navigate, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { SegmentationOverviewView } from '@/features/admin/view/segmentation-overview-view'
import { canManagePlaces, isPlaceAdmin } from '@/utils/role-helpers'

export const Route = createFileRoute('/admin/segmentation')({
  component: AdminSegmentationPage,
  beforeLoad: ({ location }) => {
    // Verificar se tem token
    if (!tokenStorage.hasToken()) {
      throw new Error('Não autenticado')
    }
  },
})

function AdminSegmentationPage() {
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

  // Verificar se pode acessar segmentação (Super Admin ou Place Admin)
  if (!canManagePlaces(user) && !isPlaceAdmin(user)) {
    return <Navigate to="/dashboard" />
  }

  return <SegmentationOverviewView />
}
