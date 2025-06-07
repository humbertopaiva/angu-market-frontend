// src/features/admin/view/subcategories-view.tsx
import React, { useEffect } from 'react'
import {
  Edit,
  FileText,
  Hash,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react'
import { SubcategoryForm } from '../components/subcategory-form'
import { useSubcategoriesViewModel } from '../viewmodel/subcategories-viewmodel'
import { useCategoriesViewModel } from '../viewmodel/categories-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import type { Subcategory } from '@/types/graphql'
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
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { isPlaceAdmin, isSuperAdmin } from '@/utils/role-helpers'

export function SubcategoriesView() {
  const {
    viewModel: subcategoriesViewModel,
    isLoading: isSubcategoriesLoading,
    subcategories,
  } = useSubcategoriesViewModel()
  const { viewModel: categoriesViewModel, categories } =
    useCategoriesViewModel()
  const { viewModel: placesViewModel, places } = usePlacesViewModel()
  const { user } = useAuthStore()
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<
    Subcategory | undefined
  >()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPlace, setFilterPlace] = React.useState<string>('all-places')
  const [filterCategory, setFilterCategory] =
    React.useState<string>('all-categories')

  useEffect(() => {
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas subcategorias do seu place
      subcategoriesViewModel.loadSubcategoriesByPlace(user.placeId)
      categoriesViewModel.loadCategoriesByPlace(user.placeId)
      setFilterPlace(user.placeId.toString())
    } else {
      // Super Admin: carregar todas as subcategorias
      subcategoriesViewModel.loadSubcategories()
      categoriesViewModel.loadCategories()
    }

    placesViewModel.loadPlaces()
  }, [user])

  // Verificar se usuário pode gerenciar subcategorias
  if (!user || (!isSuperAdmin(user) && !isPlaceAdmin(user))) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar subcategorias.
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

  // Filtrar categorias baseado no place selecionado
  const availableCategories = React.useMemo(() => {
    if (filterPlace === 'all-places') return categories
    return categories.filter((category) => category.place.id === filterPlace)
  }, [categories, filterPlace])

  const filteredSubcategories = subcategoriesViewModel.filterSubcategories({
    search: searchTerm,
    isActive: undefined,
    categoryId:
      filterCategory === 'all-categories' ? undefined : filterCategory,
  })

  const handleCreateSubcategory = () => {
    setSelectedSubcategory(undefined)
    setIsFormOpen(true)
  }

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory)
    setIsFormOpen(true)
  }

  const handleDeleteSubcategory = async (subcategory: Subcategory) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover a subcategoria "${subcategory.name}"?`,
      )
    ) {
      await subcategoriesViewModel.deleteSubcategory(
        Number(subcategory.id),
        subcategory.name,
      )
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedSubcategory) {
      await subcategoriesViewModel.updateSubcategory(data)
    } else {
      await subcategoriesViewModel.createSubcategory(data)
    }
  }

  const handlePlaceFilterChange = (value: string) => {
    setFilterPlace(value)
    setFilterCategory('all-categories') // Reset category filter

    // Se for Place Admin, não permitir mudar o filtro
    if (isPlaceAdmin(user)) {
      return
    }

    // Para Super Admin, recarregar subcategorias baseado no filtro
    if (value === 'all-places') {
      subcategoriesViewModel.loadSubcategories()
      categoriesViewModel.loadCategories()
    } else {
      subcategoriesViewModel.loadSubcategoriesByPlace(Number(value))
      categoriesViewModel.loadCategoriesByPlace(Number(value))
    }
  }

  const sortedSubcategories = subcategoriesViewModel.sortSubcategories(
    filteredSubcategories,
    'order',
  )

  // Agrupar subcategorias por categoria
  const groupedSubcategories =
    subcategoriesViewModel.groupSubcategoriesByCategory(sortedSubcategories)

  if (isSubcategoriesLoading && subcategories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando subcategorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Subcategorias
          </h1>
          <p className="text-gray-600">
            {isPlaceAdmin(user)
              ? `Gerencie subcategorias do place: ${user.place?.name || 'Seu Place'}`
              : 'Crie e gerencie subcategorias para especializar categorias'}
          </p>
        </div>
        <Button
          onClick={handleCreateSubcategory}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Subcategoria
        </Button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar subcategorias..."
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

        {/* Filtro por categoria */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">Todas as categorias</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(groupedSubcategories).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all-categories'
                ? 'Nenhuma subcategoria encontrada'
                : 'Nenhuma subcategoria cadastrada'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || filterCategory !== 'all-categories'
                ? 'Tente ajustar sua busca ou filtros.'
                : 'Comece criando sua primeira subcategoria para especializar categorias.'}
            </p>
            {!searchTerm && filterCategory === 'all-categories' && (
              <Button
                onClick={handleCreateSubcategory}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar primeira subcategoria
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSubcategories).map(
            ([categoryName, subcategoriesGroup]) => (
              <div key={categoryName}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor:
                        subcategoriesGroup[0]?.category?.color || '#22C55E',
                    }}
                  />
                  {categoryName}
                  <span className="text-sm text-gray-500 font-normal">
                    ({subcategoriesGroup.length})
                  </span>
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subcategoriesGroup.map((subcategory) => (
                    <Card
                      key={subcategory.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-600" />
                            <div>
                              <CardTitle className="text-lg leading-tight">
                                {subcategory.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Tag className="h-3 w-3" />/{subcategory.slug}
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
                                onClick={() =>
                                  handleEditSubcategory(subcategory)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteSubcategory(subcategory)
                                }
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
                            {subcategory.description}
                          </p>

                          {subcategory.icon && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Tag className="h-4 w-4" />
                              <span>Ícone: {subcategory.icon}</span>
                            </div>
                          )}

                          {subcategory.keywords && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Hash className="h-4 w-4" />
                              <span className="truncate">
                                {subcategory.keywords
                                  .split(',')
                                  .slice(0, 3)
                                  .join(', ')}
                                {subcategory.keywords.split(',').length > 3 &&
                                  '...'}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>
                              Empresas: {subcategory.companies?.length || 0}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                subcategory.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {subcategory.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Ordem: {subcategory.order || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <SubcategoryForm
        subcategory={selectedSubcategory}
        places={availablePlaces}
        categories={availableCategories}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isSubcategoriesLoading}
      />
    </div>
  )
}
