import { Navigate, createFileRoute } from '@tanstack/react-router'
import { tokenStorage } from '@/infra/storage/token-storage'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  // Redireciona baseado no estado de autenticação
  const hasToken = tokenStorage.hasToken()

  if (hasToken) {
    return <Navigate to="/dashboard" />
  }

  return <Navigate to="/auth/login" />
}
