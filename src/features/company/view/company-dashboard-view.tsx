// src/features/company/view/company-dashboard-view.tsx
import { useEffect } from 'react'
import { Building, Loader2, LogOut, Users } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { useDashboardViewModel } from '@/features/dashboard/viewmodel/dashboard-viewmodel'
import { useCompanyAuthViewModel } from '@/features/auth/viewmodel/company-auth-viewmodel'
import { UserProfileCard } from '@/features/dashboard/components/user-profile-card'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CompanyDashboardView() {
  const navigate = useNavigate()
  const dashboardViewModel = useDashboardViewModel()
  const companyAuthViewModel = useCompanyAuthViewModel()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    // Carregar dados do usuário ao montar o componente
    dashboardViewModel.loadCurrentUser()
  }, [])

  const handleLogout = () => {
    companyAuthViewModel.logout()
  }

  const handleBackToMainSite = () => {
    navigate({ to: '/auth/login' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando informações da empresa...</p>
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

  const isCompanyAdmin = user.userRoles?.some(
    (ur) => ur.role.name === 'COMPANY_ADMIN',
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header da empresa */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {user.company?.name || 'Painel da Empresa'}
            </h1>
            <p className="text-sm text-gray-600">
              {user.place?.name} - {user.place?.city}, {user.place?.state}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToMainSite}
            className="hidden sm:flex"
          >
            Site Principal
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Empresarial
          </h2>
          <p className="text-gray-600">
            Gerencie as informações e operações da sua empresa
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Profile Card - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <UserProfileCard
              user={user}
              onLogout={handleLogout}
              getUserInitials={dashboardViewModel.getUserInitials}
              formatDate={dashboardViewModel.formatDate}
            />
          </div>

          {/* Company Info and Quick Actions */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Building className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      {user.company?.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      /{user.company?.slug}
                    </p>
                  </div>

                  {user.company?.description && (
                    <p className="text-sm text-blue-700">
                      {user.company.description}
                    </p>
                  )}

                  {user.company?.phone && (
                    <div className="text-sm text-blue-700">
                      <strong>Telefone:</strong> {user.company.phone}
                    </div>
                  )}

                  {user.company?.email && (
                    <div className="text-sm text-blue-700">
                      <strong>Email:</strong> {user.company.email}
                    </div>
                  )}

                  {user.company?.website && (
                    <div className="text-sm text-blue-700">
                      <strong>Website:</strong>{' '}
                      <a
                        href={user.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {user.company.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            {isCompanyAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // TODO: Implementar gestão de funcionários
                        alert('Funcionalidade em desenvolvimento')
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Gerenciar Funcionários
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // TODO: Implementar edição de empresa
                        alert('Funcionalidade em desenvolvimento')
                      }}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      Editar Empresa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Staff Info Card */}
            {!isCompanyAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-700">
                    Informações do Funcionário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Você é funcionário desta empresa. Para alterações em
                      informações da empresa, entre em contato com o
                      administrador.
                    </p>
                    <div className="text-sm">
                      <strong>Sua função:</strong>{' '}
                      {user.userRoles?.[0]?.role?.name === 'COMPANY_STAFF'
                        ? 'Funcionário'
                        : user.userRoles?.[0]?.role?.name}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
