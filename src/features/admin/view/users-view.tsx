import React, { useEffect } from 'react'
import {
  Building,
  Edit,
  Filter,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'
import { UserForm } from '../components/user-form'
import { useUsersViewModel } from '../viewmodel/users-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import type { Place, User } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function UsersView() {
  const {
    viewModel: usersViewModel,
    isLoading: isUsersLoading,
    users,
  } = useUsersViewModel()
  const { viewModel: placesViewModel, places } = usePlacesViewModel()
  const [selectedUser, setSelectedUser] = React.useState<User | undefined>()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPlace, setFilterPlace] = React.useState<string>('')
  const [filterRole, setFilterRole] = React.useState<string>('')

  useEffect(() => {
    usersViewModel.loadUsers()
    placesViewModel.loadPlaces()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlace = !filterPlace || user.place?.id === filterPlace
    const matchesRole =
      !filterRole || user.userRoles?.[0]?.role?.name === filterRole

    return matchesSearch && matchesPlace && matchesRole
  })

  const handleCreateUser = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteUser = async (user: User) => {
    if (
      window.confirm(`Tem certeza que deseja remover o usuário "${user.name}"?`)
    ) {
      await usersViewModel.deleteUser(Number(user.id), user.name)
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedUser) {
      await usersViewModel.updateUser(data)
    } else {
      await usersViewModel.createUser(data)
    }
  }

  const getRoleDisplayName = (roleName: string) => {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ORGANIZATION_ADMIN: 'Admin da Org.',
      PLACE_ADMIN: 'Admin do Place',
      COMPANY_ADMIN: 'Admin da Empresa',
      COMPANY_STAFF: 'Funcionário',
      PUBLIC_USER: 'Usuário Público',
    }
    return roleMap[roleName] || roleName
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isUsersLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600">Crie e gerencie usuários do sistema</p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={filterPlace} onValueChange={setFilterPlace}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por place" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os places</SelectItem>
            {places.map((place) => (
              <SelectItem key={place.id} value={place.id}>
                {place.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as funções</SelectItem>
            <SelectItem value="PLACE_ADMIN">Admin do Place</SelectItem>
            <SelectItem value="COMPANY_ADMIN">Admin da Empresa</SelectItem>
            <SelectItem value="COMPANY_STAFF">Funcionário</SelectItem>
            <SelectItem value="PUBLIC_USER">Usuário Público</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterPlace || filterRole
                ? 'Nenhum usuário encontrado'
                : 'Nenhum usuário cadastrado'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || filterPlace || filterRole
                ? 'Tente ajustar sua busca ou limpar os filtros.'
                : 'Comece criando seu primeiro usuário para gerenciar acessos.'}
            </p>
            {!searchTerm && !filterPlace && !filterRole && (
              <Button
                onClick={handleCreateUser}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro usuário
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-sm font-semibold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {user.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {user.userRoles?.[0]?.role?.name &&
                          getRoleDisplayName(user.userRoles[0].role.name)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  {user.place && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{user.place.name}</span>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span className="truncate">{user.company.name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isVerified ? 'Verificado' : 'Não verificado'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UserForm
        user={selectedUser}
        places={places}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isUsersLoading}
      />
    </div>
  )
}
