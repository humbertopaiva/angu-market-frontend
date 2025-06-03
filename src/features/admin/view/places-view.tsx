import React, { useEffect } from 'react'
import {
  Building2,
  Edit,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { PlaceForm } from '../components/place-form'
import { usePlacesViewModel } from '../viewmodel/places-viewmodel'
import type { Place } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function PlacesView() {
  const { viewModel, isLoading, places } = usePlacesViewModel()
  const [selectedPlace, setSelectedPlace] = React.useState<Place | undefined>()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  useEffect(() => {
    viewModel.loadPlaces()
  }, [])

  const filteredPlaces = places.filter(
    (place) =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreatePlace = () => {
    setSelectedPlace(undefined)
    setIsFormOpen(true)
  }

  const handleEditPlace = (place: Place) => {
    setSelectedPlace(place)
    setIsFormOpen(true)
  }

  const handleDeletePlace = async (place: Place) => {
    if (
      window.confirm(`Tem certeza que deseja remover o place "${place.name}"?`)
    ) {
      await viewModel.deletePlace(Number(place.id), place.name)
    }
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedPlace) {
      await viewModel.updatePlace(data)
    } else {
      await viewModel.createPlace(data)
    }
  }

  if (isLoading && places.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando places...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Places</h1>
          <p className="text-gray-600">
            Crie e gerencie os places da organização
          </p>
        </div>
        <Button onClick={handleCreatePlace} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Place
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar places..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredPlaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm
                ? 'Nenhum place encontrado'
                : 'Nenhum place cadastrado'}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm
                ? 'Tente ajustar sua busca ou limpar os filtros.'
                : 'Comece criando seu primeiro place para organizar empresas por localização.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleCreatePlace}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro place
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{place.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPlace(place)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePlace(place)}
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
                    {place.description}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {place.city}, {place.state}
                    </span>
                  </div>
                  {place.neighborhood && (
                    <p className="text-xs text-gray-500">
                      Bairro: {place.neighborhood}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        place.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {place.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="text-xs text-gray-500">/{place.slug}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlaceForm
        place={selectedPlace}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
