import React, { useEffect, useState } from 'react'
import {
  Building,
  Crown,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import { useCompanyAdminViewModel } from '../viewmodel/company-admin-viewmodel'
import { CompaniesService } from '../services/companies-service'
import type { Company, User as UserType } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CompanyAdminManagerProps {
  company: Company
  placeId: number
  onCompanyUpdate?: (company: Company) => void
}

export function CompanyAdminManager({
  company: initialCompany,
  placeId,
  onCompanyUpdate,
}: CompanyAdminManagerProps) {
  const { viewModel, isLoading, availableUsers } = useCompanyAdminViewModel()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const [company, setCompany] = useState<Company>(initialCompany)
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false)

  const companiesService = new CompaniesService()

  useEffect(() => {
    const loadCompanyDetails = async () => {
      try {
        setLoadingCompanyDetails(true)
        console.log('Loading company details for company:', initialCompany.id)

        // Buscar empresa com detalhes completos dos usuários
        const companyWithDetails =
          await companiesService.getCompanyWithUsersDetails(
            Number(initialCompany.id),
          )

        console.log('Company details loaded:', {
          id: companyWithDetails.id,
          name: companyWithDetails.name,
          usersCount: companyWithDetails.users?.length || 0,
        })

        setCompany(companyWithDetails)
      } catch (error) {
        console.error('Error loading company details:', error)
        // Fallback para a empresa inicial se houver erro
        setCompany(initialCompany)
      } finally {
        setLoadingCompanyDetails(false)
      }
    }

    loadCompanyDetails()
    viewModel.loadAvailableUsers(placeId)
  }, [placeId, initialCompany.id])

  const currentAdmins = viewModel.getCompanyAdmins(company)
  const currentStaff = viewModel.getCompanyStaff(company)
  const filteredUsers = viewModel.filterAvailableUsers(searchTerm)
  const userGroups = viewModel.groupUsersByStatus()

  const handleAssignAdmin = async () => {
    if (!selectedUserId) return

    const result = await viewModel.assignCompanyAdmin({
      companyId: Number(company.id),
      userId: Number(selectedUserId),
    })

    if (result && onCompanyUpdate) {
      onCompanyUpdate(result)
    }

    setIsAssignDialogOpen(false)
    setSelectedUserId('')
  }

  const handleRemoveAdmin = async (userId: number) => {
    const user = availableUsers.find((u) => Number(u.id) === userId)

    if (!user) return

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${user.name} como admin da empresa "${company.name}"?`,
    )

    if (!confirmed) return

    const result = await viewModel.removeCompanyAdmin({
      companyId: Number(company.id),
      userId,
    })

    if (result && onCompanyUpdate) {
      onCompanyUpdate(result)
    }
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (user: UserType) => {
    const status = viewModel.getUserStatus(user)

    const colorClasses = {
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      gray: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          colorClasses[status.color as keyof typeof colorClasses] ||
          colorClasses.gray
        }`}
      >
        {status.label}
      </span>
    )
  }

  const handleCompanyUpdate = async (updatedCompany: Company) => {
    console.log('Company updated, refreshing details...')

    try {
      // Recarregar detalhes da empresa
      const companyWithDetails =
        await companiesService.getCompanyWithUsersDetails(
          Number(updatedCompany.id),
        )
      setCompany(companyWithDetails)

      // Recarregar usuários disponíveis
      viewModel.loadAvailableUsers(placeId)

      // Notificar componente pai se necessário
      if (onCompanyUpdate) {
        onCompanyUpdate(companyWithDetails)
      }
    } catch (error) {
      console.error('Error refreshing company details:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestão de Admins - {company.name}
          </h3>
          <p className="text-sm text-gray-600">
            Gerencie os administradores da empresa
          </p>
        </div>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Atribuir Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atribuir Admin à Empresa</DialogTitle>
              <DialogDescription>
                Selecione um usuário para se tornar administrador da empresa "
                {company.name}".
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Selecionar Usuário
                </label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um usuário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.available.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-xs text-gray-500">
                            ({user.email})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    {userGroups.companyStaff.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-xs text-gray-500">
                            (Funcionário de {user.company?.name})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    {userGroups.companyAdmin.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Crown className="h-3 w-3 text-blue-600" />
                          <span>{user.name}</span>
                          <span className="text-xs text-gray-500">
                            (Admin de {user.company?.name})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignDialogOpen(false)
                    setSelectedUserId('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignAdmin}
                  disabled={!selectedUserId || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atribuindo...
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Atribuir Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">
            Admins Atuais ({currentAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="staff">
            Funcionários ({currentStaff.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Usuários Disponíveis ({userGroups.available.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Admins */}
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Administradores da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAdmins.length === 0 ? (
                <div className="text-center py-6">
                  <UserMinus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum admin atribuído
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Esta empresa ainda não possui administradores.
                  </p>
                  <Button
                    onClick={() => setIsAssignDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Atribuir primeiro admin
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {currentAdmins.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {user.name}
                            </h4>
                            <Crown className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(user)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveAdmin(Number(user.id))}
                              className="text-red-600"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remover Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Staff */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Funcionários da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStaff.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum funcionário
                  </h3>
                  <p className="text-gray-600">
                    Esta empresa ainda não possui funcionários atribuídos.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {currentStaff.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {user.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(user)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const result = await viewModel.assignCompanyAdmin({
                              companyId: Number(company.id),
                              userId: Number(user.id),
                            })
                            if (result && onCompanyUpdate) {
                              onCompanyUpdate(result)
                            }
                          }}
                          disabled={isLoading}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Promover a Admin
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Users */}
        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Usuários Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Loading */}
                {isLoading && (
                  <div className="text-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Carregando usuários...</p>
                  </div>
                )}

                {/* Users List */}
                {!isLoading && (
                  <div className="grid gap-4">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-6">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm
                            ? 'Nenhum usuário encontrado'
                            : 'Nenhum usuário disponível'}
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm
                            ? 'Tente ajustar sua busca.'
                            : 'Todos os usuários do place já estão atribuídos ou não podem ser admins.'}
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const canBeAdmin = viewModel.canUserBeAdmin(user)
                        const isCurrentAdmin =
                          viewModel.isUserCompanyAdmin(user)

                        return (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-4 border rounded-lg ${
                              !canBeAdmin ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {getUserInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">
                                    {user.name}
                                  </h4>
                                  {isCurrentAdmin && (
                                    <Crown className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </div>
                                  {user.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                                {user.company && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Building className="h-3 w-3" />
                                    {user.company.name}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(user)}
                              {canBeAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    const result =
                                      await viewModel.assignCompanyAdmin({
                                        companyId: Number(company.id),
                                        userId: Number(user.id),
                                      })
                                    if (result && onCompanyUpdate) {
                                      onCompanyUpdate(result)
                                    }
                                  }}
                                  disabled={isLoading}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Atribuir como Admin
                                </Button>
                              )}
                              {isCurrentAdmin &&
                                Number(user.companyId) ===
                                  Number(company.id) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveAdmin(Number(user.id))
                                    }
                                    disabled={isLoading}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remover Admin
                                  </Button>
                                )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
