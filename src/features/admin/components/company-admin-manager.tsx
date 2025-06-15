// src/features/admin/components/company-admin-manager.tsx
import React, { useState, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  UserCheck, 
  UserMinus, 
  Crown, 
  Loader2,
  Building,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

import { CompanyAdminService } from '../services/company-admin-service'
import {
  ASSIGN_COMPANY_ADMIN_MUTATION,
  REMOVE_COMPANY_ADMIN_MUTATION,
  GET_AVAILABLE_COMPANY_ADMINS_QUERY,
} from '../services/companies-queries'
import { toast } from 'sonner'
import type { Company, User } from '@/types/graphql'

interface CompanyAdminManagerProps {
  company: Company
  onRefresh?: () => void
}

export function CompanyAdminManager({ 
  company, 
  onRefresh 
}: CompanyAdminManagerProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const adminService = useMemo(() => new CompanyAdminService(), [])

  // Queries
  const { data: availableUsersData, loading: loadingUsers, refetch: refetchUsers } = useQuery(
    GET_AVAILABLE_COMPANY_ADMINS_QUERY,
    {
      variables: { placeId: company.placeId },
      skip: !company.placeId,
      errorPolicy: 'all',
    }
  )

  // Mutations
  const [assignAdmin, { loading: assigningAdmin }] = useMutation(
    ASSIGN_COMPANY_ADMIN_MUTATION,
    {
      onCompleted: () => {
        toast.success('Admin atribuído com sucesso!')
        setIsAssignDialogOpen(false)
        setSelectedUserId(null)
        onRefresh?.()
        refetchUsers()
      },
      onError: (error) => {
        console.error('Error assigning admin:', error)
        toast.error(`Erro ao atribuir admin: ${error.message}`)
      },
    }
  )

  const [removeAdmin, { loading: removingAdmin }] = useMutation(
    REMOVE_COMPANY_ADMIN_MUTATION,
    {
      onCompleted: () => {
        toast.success('Admin removido com sucesso!')
        onRefresh?.()
        refetchUsers()
      },
      onError: (error) => {
        console.error('Error removing admin:', error)
        toast.error(`Erro ao remover admin: ${error.message}`)
      },
    }
  )

  // Processamento dos dados
  const currentAdmins = useMemo(() => {
    return adminService.getCompanyAdmins(company)
  }, [company, adminService])

  const availableUsers = availableUsersData?.availableCompanyAdmins || []

  const userGroups = useMemo(() => {
    return adminService.categorizeUsers(availableUsers)
  }, [availableUsers, adminService])

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return userGroups

    const filter = (users: User[]) =>
      users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return {
      available: filter(userGroups.available),
      admins: filter(userGroups.admins),
      unavailable: filter(userGroups.unavailable),
    }
  }, [userGroups, searchTerm])

  // Handlers
  const handleAssignAdmin = async () => {
    if (!selectedUserId) return

    try {
      await assignAdmin({
        variables: {
          companyId: company.id,
          userId: selectedUserId,
        },
      })
    } catch (error) {
      console.error('Error assigning admin:', error)
    }
  }

  const handleRemoveAdmin = async (userId: number) => {
    if (!confirm('Tem certeza que deseja remover este administrador?')) {
      return
    }

    try {
      await removeAdmin({
        variables: {
          companyId: company.id,
          userId,
        },
      })
    } catch (error) {
      console.error('Error removing admin:', error)
    }
  }

  const renderUserCard = (user: User, type: 'current' | 'available' | 'other') => {
    const status = adminService.formatUserStatus(user)
    
    return (
      <div
        key={user.id}
        className={`flex items-center justify-between p-4 border rounded-lg ${
          type === 'available' ? 'hover:bg-gray-50 cursor-pointer' : ''
        }`}
        onClick={type === 'available' ? () => {
          setSelectedUserId(Number(user.id))
          setIsAssignDialogOpen(true)
        } : undefined}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900">{user.name}</h4>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-gray-500">{user.phone}</p>
            )}
            {status.currentCompany && (
              <p className="text-xs text-blue-600">
                Empresa atual: {status.currentCompany}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={`
              ${status.color === 'red' ? 'border-red-200 text-red-700 bg-red-50' : ''}
              ${status.color === 'purple' ? 'border-purple-200 text-purple-700 bg-purple-50' : ''}
              ${status.color === 'blue' ? 'border-blue-200 text-blue-700 bg-blue-50' : ''}
              ${status.color === 'gray' ? 'border-gray-200 text-gray-700 bg-gray-50' : ''}
            `}
          >
            {status.label}
          </Badge>
          
          {type === 'current' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveAdmin(Number(user.id))
              }}
              disabled={removingAdmin}
              className="ml-2"
            >
              {removingAdmin ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {type === 'available' && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedUserId(Number(user.id))
                setIsAssignDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 ml-2"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Administradores</h2>
            <p className="text-gray-600">
              Gerencie os administradores da empresa <span className="font-medium">{company.name}</span>
            </p>
          </div>
        </div>

        <Button 
          onClick={() => setIsAssignDialogOpen(true)}
          disabled={loadingUsers || filteredUsers.available.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserCheck className="mr-2 h-4 w-4" />
          Atribuir Admin
        </Button>
      </div>

      {/* Dialog de Atribuição */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Atribuir Administrador
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {filteredUsers.available.length === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum usuário disponível
                </h3>
                <p className="text-gray-600">
                  Não há usuários disponíveis para se tornarem administradores desta empresa.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Selecionar usuário:
                  </label>
                  <select
                    value={selectedUserId || ''}
                    onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um usuário...</option>
                    {filteredUsers.available.map((user) => {
                      const status = adminService.formatUserStatus(user)
                      return (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {status.label}
                        </option>
                      )
                    })}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAssignDialogOpen(false)
                      setSelectedUserId(null)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAssignAdmin}
                    disabled={!selectedUserId || assigningAdmin}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {assigningAdmin ? (
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Admins Atuais ({currentAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Disponíveis ({userGroups.available.length})
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
                <div className="text-center py-8">
                  <UserMinus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum admin atribuído
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta empresa ainda não possui administradores. Atribua um admin para que 
                    alguém possa gerenciar a empresa.
                  </p>
                  <Button
                    onClick={() => setIsAssignDialogOpen(true)}
                    disabled={filteredUsers.available.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Atribuir Primeiro Admin
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentAdmins.map((admin) => renderUserCard(admin, 'current'))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Users */}
        <TabsContent value="available">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Usuários Disponíveis
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Carregando usuários...</span>
                </div>
              ) : filteredUsers.available.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário disponível'}
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'Tente ajustar os termos de busca ou limpar o filtro.'
                      : 'Não há usuários disponíveis para se tornarem administradores desta empresa.'
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Limpar busca
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-4">
                    Clique em um usuário ou no botão <UserCheck className="inline h-4 w-4" /> para atribuí-lo como administrador.
                  </div>
                  {filteredUsers.available.map((user) => renderUserCard(user, 'available'))}
                </div>
              )}

              {/* Mostrar outros usuários se houver */}
              {(filteredUsers.admins.length > 0 || filteredUsers.unavailable.length > 0) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Outros usuários no place:</h4>
                  
                  {filteredUsers.admins.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                        Já são admins de outras empresas:
                      </h5>
                      <div className="space-y-2">
                        {filteredUsers.admins.map((user) => renderUserCard(user, 'other'))}
                      </div>
                    </div>
                  )}
                  
                  {filteredUsers.unavailable.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                        Indisponíveis (roles superiores):
                      </h5>
                      <div className="space-y-2">
                        {filteredUsers.unavailable.map((user) => renderUserCard(user, 'other'))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Resumo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentAdmins.length}
              </div>
              <div className="text-sm font-medium text-blue-700">Admins Atuais</div>
              <div className="text-xs text-blue-600 mt-1">
                {currentAdmins.length === 0 ? 'Empresa sem admin' : 'Empresa gerenciada'}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {userGroups.available.length}
              </div>
              <div className="text-sm font-medium text-green-700">Usuários Disponíveis</div>
              <div className="text-xs text-green-600 mt-1">
                Podem se tornar admins
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {userGroups.admins.length + userGroups.unavailable.length}
              </div>
              <div className="text-sm font-medium text-gray-700">Outros Usuários</div>
              <div className="text-xs text-gray-600 mt-1">
                Admins ou roles superiores
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}