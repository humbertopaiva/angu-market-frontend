// src/features/admin/view/companies-view.tsx - CORRIGIDO
import React, { useEffect, useState } from 'react'
import { Building, Loader2, Plus, Search, Tags, Users } from 'lucide-react'
import { useCompaniesViewModel } from '../viewmodel/companies-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import { useSegmentsViewModel } from '../viewmodel/segments-viewmodel'
import { useCategoriesViewModel } from '../viewmodel/categories-viewmodel'
import { useSubcategoriesViewModel } from '../viewmodel/subcategories-viewmodel'
import { CompanyForm } from '../components/company-form'
import { CompanyCard } from '../components/company-card'
import { CompanySegmentationManager } from '../components/company-segmentation-manager'
import { CompanyAdminManager } from '../components/company-admin-manager'
import type { Company, Place } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { isPlaceAdmin, isSuperAdmin } from '@/utils/role-helpers'

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

  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSegmentationManagerOpen, setIsSegmentationManagerOpen] =
    useState(false)
  const [isAdminManagerOpen, setIsAdminManagerOpen] = useState(false)
  const [selectedCompanyForManagement, setSelectedCompanyForManagement] =
    useState<Company | undefined>()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlace, setFilterPlace] = useState<string>('all-places')
  const [filterSegmentStatus, setFilterSegmentStatus] = useState<string>('all')

  useEffect(() => {
    // Carregar dados baseado no tipo de usuário
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas dados do seu place
      companiesViewModel.loadCompaniesByPlace(user.placeId)
      placesViewModel.loadPlaces() // Para mostrar o nome do place
      segmentsViewModel.loadSegmentsByPlace(user.placeId)
      categoriesViewModel.loadCategoriesByPlace(user.placeId)
      subcategoriesViewModel.loadSubcategoriesByPlace(user.placeId)
      setFilterPlace(user.placeId.toString())
    } else {
      // Super Admin: carregar todos os dados
      companiesViewModel.loadCompanies()
      placesViewModel.loadPlaces()
      segmentsViewModel.loadSegments()
      categoriesViewModel.loadCategories()
      subcategoriesViewModel.loadSubcategories()
    }
  }, [user])

  // Verificar se usuário pode gerenciar empresas
  if (!user || (!isSuperAdmin(user) && !isPlaceAdmin(user))) {
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

  // Filtrar empresas
  const filteredCompanies = React.useMemo(() => {
    return companies.filter((company) => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const searchable = [
          company.name,
          company.description,
          company.slug,
          company.place.name,
          company.segment?.name || '',
          company.category?.name || '',
          company.subcategory?.name || '',
        ]
          .join(' ')
          .toLowerCase()

        if (!searchable.includes(searchLower)) {
          return false
        }
      }

      // Filtro por place (apenas para Super Admin)
      if (isSuperAdmin(user) && filterPlace !== 'all-places') {
        if (Number(company.placeId) !== Number(filterPlace)) {
          return false
        }
      }

      // Filtro por status de segmentação
      if (filterSegmentStatus !== 'all') {
        const hasCompleteSegmentation = !!(
          company.segmentId &&
          company.categoryId &&
          company.subcategoryId
        )

        if (filterSegmentStatus === 'complete' && !hasCompleteSegmentation) {
          return false
        }

        if (filterSegmentStatus === 'incomplete' && hasCompleteSegmentation) {
          return false
        }
      }

      return true
    })
  }, [companies, searchTerm, filterPlace, filterSegmentStatus, user])

  const handleCreateCompany = () => {
    setSelectedCompany(undefined)
    setIsFormOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    console.log('Editing company:', {
      id: company.id,
      name: company.name,
      segmentId: company.segmentId,
      categoryId: company.categoryId,
      subcategoryId: company.subcategoryId,
      segment: company.segment?.name,
      category: company.category?.name,
      subcategory: company.subcategory?.name,
    })
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

  const handleManageSegmentation = (company: Company) => {
    setSelectedCompanyForManagement(company)
    setIsSegmentationManagerOpen(true)
  }

  const handleManageUsers = (company: Company) => {
    setSelectedCompanyForManagement(company)
    setIsAdminManagerOpen(true)
  }

  const handleFormSubmit = async (data: any) => {
    console.log('Form submit data:', data)

    if (selectedCompany) {
      await companiesViewModel.updateCompany(data)
    } else {
      await companiesViewModel.createCompany(data)
    }
  }

  const handleCompanyUpdate = (updatedCompany: Company) => {
    // Recarregar a lista de empresas para refletir as mudanças
    if (isPlaceAdmin(user) && user.placeId) {
      companiesViewModel.loadCompaniesByPlace(user.placeId)
    } else {
      companiesViewModel.loadCompanies()
    }

    setSelectedCompanyForManagement(updatedCompany)
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

  // Estatísticas
  const stats = React.useMemo(() => {
    const total = filteredCompanies.length
    const active = filteredCompanies.filter((c) => c.isActive).length
    const withCompleteSegmentation = filteredCompanies.filter(
      (c) => c.segmentId && c.categoryId && c.subcategoryId,
    ).length
    const withUsers = filteredCompanies.filter(
      (c) => c.users && c.users.length > 0,
    ).length

    return {
      total,
      active,
      inactive: total - active,
      withCompleteSegmentation,
      incompleteSegmentation: total - withCompleteSegmentation,
      withUsers,
      withoutUsers: total - withUsers,
    }
  }, [filteredCompanies])

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

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorizadas</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.withCompleteSegmentation}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (stats.withCompleteSegmentation / (stats.total || 1)) * 100,
              )}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.withoutUsers} sem usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentação</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.incompleteSegmentation}
            </div>
            <p className="text-xs text-muted-foreground">
              precisam de categorização
            </p>
          </CardContent>
        </Card>
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

        <Select
          value={filterSegmentStatus}
          onValueChange={setFilterSegmentStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status de categorização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="complete">Categorizadas</SelectItem>
            <SelectItem value="incomplete">Não categorizadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Empresas */}
      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm
                ? 'Nenhuma empresa encontrada'
                : 'Nenhuma empresa cadastrada'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm
                ? 'Tente ajustar sua busca.'
                : 'Comece criando sua primeira empresa.'}
            </p>
            {!searchTerm && (
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
              onManageUsers={handleManageUsers}
              onManageSegmentation={handleManageSegmentation}
            />
          ))}
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

      {/* Gerenciador de Segmentação */}
      {selectedCompanyForManagement && (
        <CompanySegmentationManager
          company={selectedCompanyForManagement}
          isOpen={isSegmentationManagerOpen}
          onClose={() => {
            setIsSegmentationManagerOpen(false)
            setSelectedCompanyForManagement(undefined)
          }}
          onCompanyUpdate={handleCompanyUpdate}
        />
      )}

      {/* Gerenciador de Admins */}
      {selectedCompanyForManagement && (
        <CompanyAdminManager
          company={selectedCompanyForManagement}
        
        />
      )}
    </div>
  )
}
