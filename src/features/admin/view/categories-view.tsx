// src/features/admin/view/categories-view.tsx
import React, { useEffect } from 'react'
import {
  Edit,
  Folder,
  Hash,
  Loader2,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Tag,
  Tags,
  Trash2,
} from 'lucide-react'
import { CategoryForm } from '../components/category-form'
import { useCategoriesViewModel } from '../viewmodel/categories-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import { useSegmentsViewModel } from '../viewmodel/segments-viewmodel'
import type { Category, Place, Segment } from '@/types/graphql'
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

export function CategoriesView() {
  const {
    viewModel: categoriesViewModel,
    isLoading: isCategoriesLoading,
    categories,
  } = useCategoriesViewModel()
  const { viewModel: placesViewModel, places } = usePlacesViewModel()
  const { viewModel: segmentsViewModel, segments } = useSegmentsViewModel()
  const { user } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = React.useState<
    Category | undefined
  >()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPlace, setFilterPlace] = React.useState<string>('all-places')
  const [filterSegment, setFilterSegment] =
    React.useState<string>('all-segments')

  useEffect(() => {
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas categorias do seu place
      categoriesViewModel.loadCategoriesByPlace(user.placeId)
      segmentsViewModel.loadSegmentsByPlace(user.placeId)
      setFilterPlace(user.placeId.toString())
    } else {
      // Super Admin: carregar todas as categorias
      categoriesViewModel.loadCategories()
      segmentsViewModel.loadSegments()
    }

    placesViewModel.loadPlaces()
  }, [user])

  // Verificar se usuário pode gerenciar categorias
  if (!user || (!isSuperAdmin(user) && !isPlaceAdmin(user))) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Folder className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar categorias.
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

  const filteredCategories = categoriesViewModel.filterCategories({
    search: searchTerm,
    isActive: undefined,
    segmentId: filterSegment === 'all-segments' ? undefined : filterSegment,
  })

  const handleCreateCategory = () => {
    setSelectedCategory(undefined)
    setIsFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover a categoria "${category.name}"?`,
      )
    ) {
      await categoriesViewModel.deleteCategory(
        Number(category.id),
        category.name,
      )
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedCategory) {
      await categoriesViewModel.updateCategory(data)
    } else {
      await categoriesViewModel.createCategory(data)
    }
  }

  const handlePlaceFilterChange = (value: string) => {
    setFilterPlace(value)
    setFilterSegment('all-segments') // Reset segment filter

    // Se for Place Admin, não permitir mudar o filtro
    if (isPlaceAdmin(user)) {
      return
    }

    // Para Super Admin, recarregar categorias baseado no filtro
    if (value === 'all-places') {
      categoriesViewModel.loadCategories()
      segmentsViewModel.loadSegments()
    } else {
      categoriesViewModel.loadCategoriesByPlace(Number(value))
      segmentsViewModel.loadSegmentsByPlace(Number(value))
    }
  }

  const sortedCategories = categoriesViewModel.sortCategories(
    filteredCategories,
    'order',
  )

  if (isCategoriesLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Categorias
          </h1>
          <p className="text-gray-600">
            {isPlaceAdmin(user)
              ? `Gerencie categorias do place: ${user.place?.name || 'Seu Place'}`
              : 'Crie e gerencie categorias para organizar empresas'}
          </p>
        </div>
        <Button
          onClick={handleCreateCategory}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
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
                {segment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sortedCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterSegment !== 'all-segments'
                ? 'Nenhuma categoria encontrada'
                : 'Nenhuma categoria cadastrada'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || filterSegment !== 'all-segments'
                ? 'Tente ajustar sua busca ou filtros.'
                : 'Comece criando sua primeira categoria para organizar empresas.'}
            </p>
            {!searchTerm && filterSegment === 'all-segments' && (
              <Button
                onClick={handleCreateCategory}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar primeira categoria
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((category) => (
            <Card
              key={category.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: category.color || '#22C55E' }}
                    />
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Tag className="h-3 w-3" />/{category.slug}
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
                      <DropdownMenuItem
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteCategory(category)}
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
                    {category.description}
                  </p>

                  {/* Segmentos da categoria */}
                  {category.segments && category.segments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tags className="h-4 w-4" />
                      <span>Segmentos:</span>
                      <div className="flex gap-1">
                        {category.segments.slice(0, 2).map((segment) => (
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
                        {category.segments.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{category.segments.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {category.icon && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Palette className="h-4 w-4" />
                      <span>Ícone: {category.icon}</span>
                    </div>
                  )}

                  {category.keywords && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hash className="h-4 w-4" />
                      <span className="truncate">
                        {category.keywords.split(',').slice(0, 3).join(', ')}
                        {category.keywords.split(',').length > 3 && '...'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Subcategorias: {category.subcategories?.length || 0}
                    </span>
                    <span>•</span>
                    <span>Empresas: {category.companies?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Ordem: {category.order || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryForm
        category={selectedCategory}
        places={availablePlaces}
        segments={availableSegments}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isCategoriesLoading}
      />
    </div>
  )
}
