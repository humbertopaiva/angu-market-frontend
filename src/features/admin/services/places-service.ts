import {
  CREATE_PLACE_MUTATION,
  DELETE_PLACE_MUTATION,
  GET_PLACES_QUERY,
  GET_PLACE_BY_ID_QUERY,
  UPDATE_PLACE_MUTATION,
} from './places-queries'
import type { Place } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export interface CreatePlaceInput {
  name: string
  slug: string
  description: string
  city: string
  state: string
  neighborhood?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  logo?: string
  banner?: string
  isActive?: boolean
}

export interface UpdatePlaceInput extends CreatePlaceInput {
  id: number
}

export class PlacesService {
  async createPlace(input: CreatePlaceInput): Promise<Place> {
    try {
      // Limpar campos undefined
      const cleanInput = Object.fromEntries(
        Object.entries(input).filter(
          ([_, value]) => value !== undefined && value !== null && value !== '',
        ),
      )

      console.log('Creating place with input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_PLACE_MUTATION,
        variables: { createPlaceInput: cleanInput },
        refetchQueries: [{ query: GET_PLACES_QUERY }],
      })

      return data.createPlace as Place
    } catch (error) {
      console.error('Create place error:', error)
      throw error
    }
  }

  async updatePlace(input: UpdatePlaceInput): Promise<Place> {
    try {
      // Limpar campos undefined
      const cleanInput = Object.fromEntries(
        Object.entries(input).filter(
          ([_, value]) => value !== undefined && value !== null && value !== '',
        ),
      )

      console.log('Updating place with input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PLACE_MUTATION,
        variables: { updatePlaceInput: cleanInput },
        refetchQueries: [{ query: GET_PLACES_QUERY }],
      })

      return data.updatePlace as Place
    } catch (error) {
      console.error('Update place error:', error)
      throw error
    }
  }

  async deletePlace(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_PLACE_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_PLACES_QUERY }],
      })
    } catch (error) {
      console.error('Delete place error:', error)
      throw error
    }
  }

  async getPlaces(): Promise<Array<Place>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_PLACES_QUERY,
      })

      return data.places.edges.map((edge: any) => edge.node) as Array<Place>
    } catch (error) {
      console.error('Get places error:', error)
      throw error
    }
  }

  async getPlaceById(id: string): Promise<Place> {
    try {
      const { data } = await apolloClient.query({
        query: GET_PLACE_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.place as Place
    } catch (error) {
      console.error('Get place by id error:', error)
      throw error
    }
  }
}
