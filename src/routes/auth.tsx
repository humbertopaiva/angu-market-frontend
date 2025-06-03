import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})

function AuthLayout() {
  // Se já estiver logado, redireciona para dashboard
  const hasToken = tokenStorage.hasToken()

  if (hasToken) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
