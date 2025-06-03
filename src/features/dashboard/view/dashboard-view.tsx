import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { UserProfileCard } from '../components/user-profile-card'
import { useDashboardViewModel } from '../viewmodel/dashboard-viewmodel'
import { useAuthStore } from '@/features/auth/stores/auth-store'

export function DashboardView() {
  const dashboardViewModel = useDashboardViewModel()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    // Carregar dados do usuário ao montar o componente
    dashboardViewModel.loadCurrentUser()
  }, [])

  const handleLogout = () => {
    dashboardViewModel.logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando suas informações...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Erro ao carregar informações do usuário.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle</p>
        </div>

        <UserProfileCard
          user={user}
          onLogout={handleLogout}
          getUserInitials={dashboardViewModel.getUserInitials}
          formatDate={dashboardViewModel.formatDate}
        />
      </div>
    </div>
  )
}
