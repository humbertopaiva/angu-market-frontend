import { useState } from 'react'
import { toast } from 'sonner'
import { PlacesService } from '../services/places-service'
import type {
  CreatePlaceInput,
  UpdatePlaceInput,
} from '../services/places-service'
import type { Place } from '@/types/graphql'

export class PlacesViewModel {
  private placesService: PlacesService
  private setLoading: (loading: boolean) => void
  private setPlaces: (places: Array<Place>) => void
  private places: Array<Place>

  constructor(
    placesService: PlacesService,
    setLoading: (loading: boolean) => void,
    setPlaces: (places: Array<Place>) => void,
    places: Array<Place>,
  ) {
    this.placesService = placesService
    this.setLoading = setLoading
    this.setPlaces = setPlaces
    this.places = places
  }

  async loadPlaces(): Promise<void> {
    try {
      this.setLoading(true)
      const places = await this.placesService.getPlaces()
      this.setPlaces(places)
    } catch (error: any) {
      console.error('Error loading places:', error)
      toast.error('Erro ao carregar places', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async createPlace(input: CreatePlaceInput): Promise<void> {
    try {
      this.setLoading(true)
      const newPlace = await this.placesService.createPlace(input)
      this.setPlaces([...this.places, newPlace])

      toast.success('Place criado com sucesso!', {
        description: `${newPlace.name} foi adicionado.`,
      })
    } catch (error: any) {
      console.error('Error creating place:', error)
      toast.error('Erro ao criar place', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async updatePlace(input: UpdatePlaceInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedPlace = await this.placesService.updatePlace(input)
      const updatedPlaces = this.places.map((place) =>
        place.id === updatedPlace.id ? updatedPlace : place,
      )
      this.setPlaces(updatedPlaces)

      toast.success('Place atualizado com sucesso!', {
        description: `${updatedPlace.name} foi atualizado.`,
      })
    } catch (error: any) {
      console.error('Error updating place:', error)
      toast.error('Erro ao atualizar place', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async deletePlace(id: number, name: string): Promise<void> {
    try {
      this.setLoading(true)
      await this.placesService.deletePlace(id)
      const filteredPlaces = this.places.filter(
        (place) => Number(place.id) !== id,
      )
      this.setPlaces(filteredPlaces)

      toast.success('Place removido com sucesso!', {
        description: `${name} foi removido.`,
      })
    } catch (error: any) {
      console.error('Error deleting place:', error)
      toast.error('Erro ao remover place', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message
    }
    if (error?.networkError?.message) {
      return 'Erro de conexão com o servidor'
    }
    return 'Erro interno do servidor'
  }
}

export function usePlacesViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [places, setPlaces] = useState<Array<Place>>([])
  const placesService = new PlacesService()

  const viewModel = new PlacesViewModel(
    placesService,
    setIsLoading,
    setPlaces,
    places,
  )

  return {
    viewModel,
    isLoading,
    places,
  }
}
