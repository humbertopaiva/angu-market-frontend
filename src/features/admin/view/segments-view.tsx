// src/features/admin/view/segments-view.tsx
import React, { useEffect } from 'react'
import {
  Edit,
  Loader2,
  MoreHorizontal,
  Palette,
  Plus,
  Search,
  Tag,
  Tags,
  Trash2,
} from 'lucide-react'
import { SegmentForm } from '../components/segment-form'
import { useSegmentsViewModel } from '../viewmodel/segments-viewmodel'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import type { Place, Segment } from '@/types/graphql'
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

export function SegmentsView() {
  const {
    viewModel: segmentsViewModel,
    isLoading: isSegmentsLoading,
    segments,
  } = useSegmentsViewModel()
  const { viewModel: placesViewModel, places } = usePlacesViewModel()
  const { user } = useAuthStore()
  const [selectedSegment, setSelectedSegment] = React.useState<
    Segment | undefined
  >()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterPlace, setFilterPlace] = React.useState<string>('all-places')

  useEffect(() => {
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas segmentos do seu place
      segmentsViewModel.loadSegmentsByPlace(user.placeId)
      setFilterPlace(user.placeId.toString())
    } else {
      // Super Admin: carregar todos os segmentos
      segmentsViewModel.loadSegments()
    }

    placesViewModel.loadPlaces()
  }, [user])

  // Verificar se usuário pode gerenciar segmentos
  if (!user || (!isSuperAdmin(user) && !isPlaceAdmin(user))) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Tags className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para gerenciar segmentos.
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

  const filteredSegments = segmentsViewModel.filterSegments({
    search: searchTerm,
    isActive: undefined,
  })

  const handleCreateSegment = () => {
    setSelectedSegment(undefined)
    setIsFormOpen(true)
  }

  const handleEditSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    setIsFormOpen(true)
  }

  const handleDeleteSegment = async (segment: Segment) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover o segmento "${segment.name}"?`,
      )
    ) {
      await segmentsViewModel.deleteSegment(Number(segment.id), segment.name)
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedSegment) {
      await segmentsViewModel.updateSegment(data)
    } else {
      await segmentsViewModel.createSegment(data)
    }
  }

  const handlePlaceFilterChange = (value: string) => {
    setFilterPlace(value)

    // Se for Place Admin, não permitir mudar o filtro
    if (isPlaceAdmin(user)) {
      return
    }

    // Para Super Admin, recarregar segmentos baseado no filtro
    if (value === 'all-places') {
      segmentsViewModel.loadSegments()
    } else {
      segmentsViewModel.loadSegmentsByPlace(Number(value))
    }
  }

  const sortedSegments = segmentsViewModel.sortSegments(
    filteredSegments,
    'order',
  )

  if (isSegmentsLoading && segments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando segmentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Segmentos
          </h1>
          <p className="text-gray-600">
            {isPlaceAdmin(user)
              ? `Gerencie segmentos do place: ${user.place?.name || 'Seu Place'}`
              : 'Crie e gerencie segmentos para organizar categorias'}
          </p>
        </div>
        <Button
          onClick={handleCreateSegment}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Segmento
        </Button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar segmentos..."
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
      </div>

      {sortedSegments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tags className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm
                ? 'Nenhum segmento encontrado'
                : 'Nenhum segmento cadastrado'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm
                ? 'Tente ajustar sua busca.'
                : 'Comece criando seu primeiro segmento para organizar categorias.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleCreateSegment}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro segmento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedSegments.map((segment) => (
            <Card
              key={segment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: segment.color || '#6B7280' }}
                    />
                    <div>
                      <CardTitle className="text-lg leading-tight">
                        {segment.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Tag className="h-3 w-3" />/{segment.slug}
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
                        onClick={() => handleEditSegment(segment)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteSegment(segment)}
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
                    {segment.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Palette className="h-4 w-4" />
                    <span>Cor:</span>
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: segment.color || '#6B7280' }}
                    />
                  </div>

                  {segment.icon && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>Ícone: {segment.icon}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Categorias: {segment.categories?.length || 0}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        segment.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {segment.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Ordem: {segment.order || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SegmentForm
        segment={selectedSegment}
        places={availablePlaces}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isSegmentsLoading}
      />
    </div>
  )
}
