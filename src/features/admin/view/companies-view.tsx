// src/features/admin/view/companies-view.tsx - ENHANCED WITH SEGMENTATION
import React, { useEffect } from 'react'
import {
  Building,
  Edit,
  FileText,
  Filter,
  Folder,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Tags,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { CompanyForm } from '../components/company-form'
import { CompanyAdminManager } from '../components/company-admin-manager'
import { useCompaniesViewModel } from '../viewmodel/companies-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import { useSegmentsViewModel } from '../viewmodel/segments-viewmodel'
import { useCategoriesViewModel } from '../viewmodel/categories-viewmodel'
import { useSubcategoriesViewModel } from '../viewmodel/subcategories-viewmodel'
import type { Company } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { viewModel: segmentsViewModel, segments } = useSegmentsViewModel()
  const { viewModel: categoriesViewModel, categories } =
    useCategoriesViewModel()
  const { viewModel: subcategoriesViewModel, subcategories } =
    useSubcategoriesViewModel()
  const { user } = useAuthStore()
  const [selectedCompany, setSelectedCompany] = React.useState<
    Company | undefined
  >()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isAdminManagerOpen, setIsAdminManagerOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPlace, setFilterPlace] = React.useState<string>('all-places')
  const [filterSegment, setFilterSegment] =
    React.useState<string>('all-segments')
  const [filterCategory, setFilterCategory] =
    React.useState<string>('all-categories')

  useEffect(() => {
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas dados do seu place
      companiesViewModel.loadCompaniesByPlace(user.placeId)
      segmentsViewModel.loadSegmentsByPlace(user.placeId)
      categoriesViewModel.loadCategoriesByPlace(user.placeId)
      subcategoriesViewModel.loadSubcategoriesByPlace(user.placeId)
      setFilterPlace(user.placeId.toString())
    } else {
      // Super Admin: carregar todos os dados
      companiesViewModel.loadCompanies()
      segmentsViewModel.loadSegments()
      categoriesViewModel.loadCategories()
      subcategoriesViewModel.loadSubcategories()
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

  // Filtrar segmentos baseado no place selecionado
  const availableSegments = React.useMemo(() => {
    if (filterPlace === 'all-places') return segments
    return segments.filter((segment) => segment.place.id === filterPlace)
  }, [segments, filterPlace])

  // Filtrar categorias baseado no place e segmento selecionado
  const availableCategories = React.useMemo(() => {
    let filtered = categories

    if (filterPlace !== 'all-places') {
      filtered = filtered.filter(
        (category) => category.place.id === filterPlace,
      )
    }

    if (filterSegment !== 'all-segments') {
      filtered = filtered.filter((category) =>
        category.segments?.some((segment) => segment.id === filterSegment),
      )
    }

    return filtered
  }, [categories, filterPlace, filterSegment])

  const filteredCompanies = companiesViewModel.filterCompanies({
    search: searchTerm,
    isActive: undefined,
    hasUsers: undefined,
    placeId: filterPlace === 'all-places' ? undefined : Number(filterPlace),
    categoryId:
      filterCategory === 'all-categories' ? undefined : Number(filterCategory),
  })

  const handleCreateCompany = () => {
    setSelectedCompany(undefined)
    setIsFormOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsFormOpen(true)
  }

  const handleDeleteCompany = async (company: Company) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover a empresa "${company.name}"?`,
      )
    ) {
      await companiesViewModel.deleteCompany(Number(company.id))
    }
  }

  const handleManageAdmins = (company: Company) => {
    setSelectedCompany(company)
    setIsAdminManagerOpen(true)
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
    setFilterSegment('all-segments')
    setFilterCategory('all-categories')

    // Se for Place Admin, não permitir mudar o filtro
    if (isPlaceAdmin(user)) {
      return
    }

    // Para Super Admin, recarregar dados baseado no filtro
    if (value === 'all-places') {
      companiesViewModel.loadCompanies()
      segmentsViewModel.loadSegments()
      categoriesViewModel.loadCategories()
      subcategoriesViewModel.loadSubcategories()
    } else {
      companiesViewModel.loadCompaniesByPlace(Number(value))
      segmentsViewModel.loadSegmentsByPlace(Number(value))
      categoriesViewModel.loadCategoriesByPlace(Number(value))
      subcategoriesViewModel.loadSubcategoriesByPlace(Number(value))
    }
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

  // Estatísticas rápidas
  const stats = {
    total: filteredCompanies.length,
    active: filteredCompanies.filter((c) => c.isActive).length,
    withCategory: filteredCompanies.filter(
      (c) => c.categoryId || c.subcategoryId,
    ).length,
    withAdmins: filteredCompanies.filter((c) =>
      c.users?.some((u) =>
        u.userRoles?.some((ur) => ur.role.name === 'COMPANY_ADMIN'),
      ),
    ).length,
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
              : 'Crie e gerencie empresas do sistema'}
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

      {/* Filtros */}
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

        {/* Filtro por segmento */}
        <Select value={filterSegment} onValueChange={setFilterSegment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-segments">Todos os segmentos</SelectItem>
            {availableSegments.map((segment) => (
              <SelectItem key={segment.id} value={segment.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: segment.color || '#6B7280' }}
                  />
                  {segment.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por categoria */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">Todas as categorias</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: category.color || '#22C55E' }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Estatísticas das Empresas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <div className="text-sm text-gray-600">Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.withCategory}
              </div>
              <div className="text-sm text-gray-600">Categorizadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.withAdmins}
              </div>
              <div className="text-sm text-gray-600">Com Admins</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all-categories'
                ? 'Nenhuma empresa encontrada'
                : 'Nenhuma empresa cadastrada'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || filterCategory !== 'all-categories'
                ? 'Tente ajustar sua busca ou filtros.'
                : 'Comece criando sua primeira empresa.'}
            </p>
            {!searchTerm && filterCategory === 'all-categories' && (
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
            const adminsCount =
              company.users?.filter((user) =>
                user.userRoles?.some((ur) => ur.role.name === 'COMPANY_ADMIN'),
              ).length || 0

            const staffCount =
              company.users?.filter((user) =>
                user.userRoles?.some((ur) => ur.role.name === 'COMPANY_STAFF'),
              ).length || 0

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
                          <Tag className="h-3 w-3" />/{company.slug}
                        </p>
                      </div>
                    </div>
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
                          onClick={() => handleManageAdmins(company)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Gerenciar Admins
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCompany(company)}
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
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {company.description}
                    </p>

                    {/* Mostrar categorização */}
                    {(company.category || company.subcategory) && (
                      <div className="space-y-1">
                        {company.category && (
                          <div className="flex items-center gap-2 text-sm">
                            <Folder className="h-4 w-4 text-green-600" />
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{
                                backgroundColor:
                                  company.category.color || '#22C55E',
                              }}
                            >
                              {company.category.name}
                            </span>
                          </div>
                        )}
                        {company.subcategory && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-orange-600" />
                            <span className="text-orange-700 font-medium">
                              {company.subcategory.name}
                            </span>
                          </div>
                        )}
                        {company.category?.segments &&
                          company.category.segments.length > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Tags className="h-4 w-4 text-purple-600" />
                              {company.category.segments.map((segment) => (
                                <span
                                  key={segment.id}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: segment.color || '#6B7280',
                                    color: 'white',
                                  }}
                                >
                                  {segment.name}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Informações do place */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>
                        {company.place.name} - {company.place.city},{' '}
                        {company.place.state}
                      </span>
                    </div>

                    {/* Contadores de usuários */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span
                          className={
                            adminsCount > 0
                              ? 'text-green-600 font-medium'
                              : 'text-orange-600'
                          }
                        >
                          {adminsCount} admin{adminsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {staffCount > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-600">
                            {staffCount} funcionário
                            {staffCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          company.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.isActive ? 'Ativo' : 'Inativo'}
                      </span>

                      {!company.category && !company.subcategory && (
                        <span className="text-xs text-amber-600 font-medium">
                          Sem categoria
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Formulário de Empresa */}
      <CompanyForm
        company={selectedCompany}
        places={availablePlaces}
        segments={segments}
        categories={categories}
        subcategories={subcategories}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isCompaniesLoading}
      />

      {/* Gerenciador de Admins */}
      {selectedCompany && (
        <Dialog open={isAdminManagerOpen} onOpenChange={setIsAdminManagerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Admins da Empresa</DialogTitle>
              <DialogDescription>
                Gerencie os administradores da empresa "{selectedCompany.name}".
              </DialogDescription>
            </DialogHeader>
            <CompanyAdminManager
              company={selectedCompany}
              placeId={Number(selectedCompany.placeId)}
              onCompanyUpdate={(updatedCompany) => {
                setSelectedCompany(updatedCompany)
                // Recarregar lista de empresas
                if (isPlaceAdmin(user) && user.placeId) {
                  companiesViewModel.loadCompaniesByPlace(user.placeId)
                } else {
                  companiesViewModel.loadCompanies()
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
