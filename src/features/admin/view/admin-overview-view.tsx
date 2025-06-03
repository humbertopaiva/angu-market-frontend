import React, { useEffect } from 'react'
import { Building2, MapPin, TrendingUp, Users } from 'lucide-react'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import { useUsersViewModel } from '../viewmodel/users-viewmodel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminOverviewView() {
  const { viewModel: placesViewModel, places } = usePlacesViewModel()
  const { viewModel: usersViewModel, users } = useUsersViewModel()

  useEffect(() => {
    placesViewModel.loadPlaces()
    usersViewModel.loadUsers()
  }, [])

  const activePlaces = places.filter((place) => place.isActive).length
  const activeUsers = users.filter((user) => user.isActive).length
  const verifiedUsers = users.filter((user) => user.isVerified).length
  const totalCities = new Set(
    places.map((place) => `${place.city}, ${place.state}`),
  ).size

  const stats = [
    {
      title: 'Total de Places',
      value: places.length,
      description: `${activePlaces} ativos`,
      icon: Building2,
      color: 'blue',
    },
    {
      title: 'Total de Usuários',
      value: users.length,
      description: `${activeUsers} ativos`,
      icon: Users,
      color: 'green',
    },
    {
      title: 'Usuários Verificados',
      value: verifiedUsers,
      description: `${Math.round((verifiedUsers / users.length) * 100) || 0}% do total`,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Cidades Atendidas',
      value: totalCities,
      description: 'Distribuição geográfica',
      icon: MapPin,
      color: 'orange',
    },
  ]

  const recentPlaces = places
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)

  const recentUsers = users
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-600">Dashboard administrativo do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-${stat.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Places */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Places Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPlaces.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum place cadastrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{place.name}</p>
                      <p className="text-xs text-gray-500">
                        {place.city}, {place.state}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        place.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {place.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum usuário cadastrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isVerified ? 'Verificado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <Building2 className="h-8 w-8 text-blue-600 mx-auto" />
              <h3 className="font-medium">Criar Place</h3>
              <p className="text-sm text-gray-600">
                Adicione um novo local para organizar empresas
              </p>
            </div>
            <div className="text-center space-y-2">
              <Users className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="font-medium">Adicionar Usuário</h3>
              <p className="text-sm text-gray-600">
                Crie contas para administradores e funcionários
              </p>
            </div>
            <div className="text-center space-y-2">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto" />
              <h3 className="font-medium">Ver Relatórios</h3>
              <p className="text-sm text-gray-600">
                Analise métricas e crescimento da plataforma
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
