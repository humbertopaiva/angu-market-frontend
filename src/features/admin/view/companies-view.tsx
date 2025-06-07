import React, { useEffect } from 'react'
import {
  Building,
  Clock,
  Crown,
  Edit,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from 'lucide-react'
import { CompanyForm } from '../components/company-form'
import { CompanyAdminManager } from '../components/company-admin-manager'
import { useCompaniesViewModel } from '../viewmodel/companies-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'

import type { Company } from '@/types/graphql'
import { RoleType } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import {
  canManageCompanies,
  canManageSpecificCompany,
  isPlaceAdmin,
  isSuperAdmin,
} from '@/utils/role-helpers'

export function CompaniesView() {
  const {
    viewModel: companiesViewModel,
    isLoading: isCompaniesLoading,
    companies,
  } = useCompaniesViewModel()
  const { viewModel: placesViewModel, places } = usePlacesViewModel()
  const { user } = useAuthStore()
  const [selectedCompany, setSelectedCompany] = React.useState<
    Company | undefined
  >()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPlace, setFilterPlace] = React.useState<string>('all-places')

  // NOVO: Estados para gestão de admin
  const [isAdminManagerOpen, setIsAdminManagerOpen] = React.useState(false)
  const [selectedCompanyForAdmin, setSelectedCompanyForAdmin] = React.useState<
    Company | undefined
  >()

  useEffect(() => {
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas empresas do seu place
      companiesViewModel.loadCompaniesByPlace(user.placeId)
      setFilterPlace(user.placeId.toString()) // Auto-selecionar seu place
    } else {
      // Super Admin: carregar todas as empresas
      companiesViewModel.loadCompanies()
    }

    placesViewModel.loadPlaces()
  }, [user])

  // Verificar se usuário pode gerenciar empresas
  if (!user || !canManageCompanies(user)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar empresas.
          </p>
        </div>
      </div>
    )
  }

  // Filtrar places baseado no tipo de usuário
  const availablePlaces =
    isPlaceAdmin(user) && user.placeId
      ? places.filter((place) => Number(place.id) === user.placeId)
      : places

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.place.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlace =
      filterPlace === 'all-places' || company.place.id === filterPlace

    // Place Admin só vê empresas do seu place
    const hasPermission =
      isPlaceAdmin(user) && user.placeId
        ? Number(company.placeId) === user.placeId
        : true

    return matchesSearch && matchesPlace && hasPermission
  })

  const handleCreateCompany = () => {
    setSelectedCompany(undefined)
    setIsFormOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    // Verificar se pode editar esta empresa específica
    if (!canManageSpecificCompany(user, Number(company.placeId))) {
      return
    }
    setSelectedCompany(company)
    setIsFormOpen(true)
  }

  const handleDeleteCompany = async (company: Company) => {
    // Verificar se pode deletar esta empresa específica
    if (!canManageSpecificCompany(user, Number(company.placeId))) {
      return
    }

    if (
      window.confirm(
        `Tem certeza que deseja remover a empresa "${company.name}"?`,
      )
    ) {
      await companiesViewModel.deleteCompany(Number(company.id), company.name)
    }
  }

  // NOVO: Função para abrir gestão de admin
  const handleManageAdmin = (company: Company) => {
    if (!canManageSpecificCompany(user, Number(company.placeId))) {
      return
    }
    setSelectedCompanyForAdmin(company)
    setIsAdminManagerOpen(true)
  }

  // NOVO: Função para atualizar empresa após mudanças de admin
  const handleCompanyUpdate = (updatedCompany: Company) => {
    // Atualizar a lista de empresas
    companiesViewModel.loadCompanies()
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedCompany) {
      await companiesViewModel.updateCompany(data)
    } else {
      await companiesViewModel.createCompany(data)
    }
  }

  const handlePlaceFilterChange = (value: string) => {
    setFilterPlace(value)

    // Se for Place Admin, não permitir mudar o filtro
    if (isPlaceAdmin(user)) {
      return
    }

    // Para Super Admin, recarregar empresas baseado no filtro
    if (value === 'all-places') {
      companiesViewModel.loadCompanies()
    } else {
      companiesViewModel.loadCompaniesByPlace(Number(value))
    }
  }

  const getCompanyAdmins = (company: Company): string => {
    console.debug('=== GET COMPANY ADMINS IN VIEW DEBUG ===')
    console.debug('Company:', company.name, 'ID:', company.id)
    console.debug('Users count:', company.users?.length || 0)

    if (!company.users || company.users.length === 0) {
      console.debug('No users found')
      return 'Sem admin'
    }

    console.debug('Checking users for admin roles...')

    const admins = company.users.filter((companyUser) => {
      console.debug('User:', companyUser.name, 'ID:', companyUser.id)
      console.debug('User roles count:', companyUser.userRoles?.length || 0)

      if (!companyUser.userRoles || companyUser.userRoles.length === 0) {
        console.debug('User has no roles')
        return false
      }

      const roles = companyUser.userRoles
        .map((ur) => {
          console.debug('Role object:', ur.role)
          return ur.role.name
        })
        .filter(Boolean)

      console.debug('User roles:', roles)

      const isAdmin = roles.includes(RoleType.COMPANY_ADMIN)
      console.debug('Is admin:', isAdmin)

      return isAdmin
    })

    console.debug(
      'Found admins:',
      admins.map((a) => ({ name: a.name, id: a.id })),
    )

    if (admins.length === 0) {
      console.debug('No admins found')
      return 'Sem admin'
    }

    if (admins.length === 1) {
      console.debug('One admin found:', admins[0].name)
      return admins[0].name
    }

    console.debug('Multiple admins found:', admins.length)
    return `${admins[0].name} +${admins.length - 1}`
  }

  if (isCompaniesLoading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Empresas
          </h1>
          <p className="text-gray-600">
            {isPlaceAdmin(user)
              ? `Gerencie empresas do place: ${user.place?.name || 'Seu Place'}`
              : 'Crie e gerencie empresas nos places'}
          </p>
        </div>
        <Button
          onClick={handleCreateCompany}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Mostrar filtro de place apenas para Super Admin */}
        {isSuperAdmin(user) && (
          <Select value={filterPlace} onValueChange={handlePlaceFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por place" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-places">Todos os places</SelectItem>
              {places.map((place) => (
                <SelectItem key={place.id} value={place.id}>
                  {place.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Para Place Admin, mostrar apenas informação do place atual */}
        {isPlaceAdmin(user) && user.place && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {user.place.name}
            </span>
          </div>
        )}
      </div>

      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterPlace !== 'all-places'
                ? 'Nenhuma empresa encontrada'
                : 'Nenhuma empresa cadastrada'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || filterPlace !== 'all-places'
                ? 'Tente ajustar sua busca ou limpar os filtros.'
                : isPlaceAdmin(user)
                  ? 'Comece criando sua primeira empresa neste place.'
                  : 'Comece criando sua primeira empresa para cadastrar negócios.'}
            </p>
            {!searchTerm && filterPlace === 'all-places' && (
              <Button
                onClick={handleCreateCompany}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar primeira empresa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => {
            const canManageThisCompany = canManageSpecificCompany(
              user,
              Number(company.placeId),
            )

            return (
              <Card
                key={company.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg leading-tight">
                          {company.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {company.place.name}
                        </p>
                      </div>
                    </div>
                    {canManageThisCompany && (
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
                          <DropdownMenuItem
                            onClick={() => handleEditCompany(company)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleManageAdmin(company)}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Gerenciar Admins
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCompany(company)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {company.description}
                    </p>

                    {/* NOVO: Mostrar admin da empresa */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Crown className="h-4 w-4" />
                      <span className="font-medium">Admin:</span>
                      <span>{getCompanyAdmins(company)}</span>
                    </div>

                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{company.phone}</span>
                      </div>
                    )}

                    {company.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}

                    {company.openingHours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="truncate">{company.openingHours}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          company.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                      <span className="text-xs text-gray-500">
                        /{company.slug}
                      </span>
                    </div>

                    {/* NOVO: Botão rápido para gerenciar admin */}
                    {canManageThisCompany && (
                      <div className="pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageAdmin(company)}
                          className="w-full flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Gerenciar Admins
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      <CompanyForm
        company={selectedCompany}
        places={availablePlaces}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isCompaniesLoading}
      />

      {/* NOVO: Dialog para gestão de admin */}
      <Dialog open={isAdminManagerOpen} onOpenChange={setIsAdminManagerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Gestão de Administradores
            </DialogTitle>
            <DialogDescription>
              Gerencie os administradores da empresa "
              {selectedCompanyForAdmin?.name}".
            </DialogDescription>
          </DialogHeader>

          {selectedCompanyForAdmin && (
            <CompanyAdminManager
              company={selectedCompanyForAdmin}
              placeId={Number(selectedCompanyForAdmin.placeId)}
              onCompanyUpdate={handleCompanyUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
