import {
  CREATE_MOVIE,
  DELETE_MOVIE,
  GET_GENRES,
  GET_MOVIE,
  GET_MOVIES,
  UPDATE_MOVIE,
} from '../graphql/movies.graphql'
import type {
  CreateMovieInput,
  Genre,
  Movie,
  MovieConnection,
  MovieFilters,
  UpdateMovieInput,
} from '../model/movie.model'
import { apolloClient } from '@/core/lib/apollo'

export class MoviesService {
  async getMovies(
    filters?: MovieFilters,
    pagination?: {
      page?: number
      pageSize?: number
      after?: string
      orderBy?: { field: string; direction: 'ASC' | 'DESC' }
    },
  ): Promise<MovieConnection> {
    const pageSize = pagination?.pageSize || 10
    const after = pagination?.after
    const orderBy = pagination?.orderBy || {
      field: 'CREATED_AT',
      direction: 'DESC',
    }

    const { data } = await apolloClient.query({
      query: GET_MOVIES,
      variables: {
        filters,
        pagination: {
          first: pageSize,
          after,
          orderBy,
        },
      },
      fetchPolicy: 'network-only', // Sempre buscar dados novos
    })
    return data.movies
  }

  async getMovie(id: string): Promise<Movie> {
    const { data } = await apolloClient.query({
      query: GET_MOVIE,
      variables: { id },
      fetchPolicy: 'network-only',
    })
    return data.movie
  }

  async getGenres(): Promise<Array<Genre>> {
    const { data } = await apolloClient.query({
      query: GET_GENRES,
      fetchPolicy: 'network-only',
    })
    return data.genres
  }

  async createMovie(input: CreateMovieInput): Promise<Movie> {
    // Criamos uma cópia do input para manipular os dados
    const formattedInput = { ...input }

    // Verificamos se existe releaseDate e formatamos para uma string YYYY-MM-DD
    if (formattedInput.releaseDate) {
      formattedInput.releaseDate = new Date(formattedInput.releaseDate)
        .toISOString()
        .split('T')[0]
    }

    const { data } = await apolloClient.mutate({
      mutation: CREATE_MOVIE,
      variables: { input: formattedInput },
    })
    return data.createMovie
  }

  async updateMovie(input: UpdateMovieInput): Promise<Movie> {
    // Criamos uma cópia do input para manipular os dados
    const formattedInput = { ...input }

    // Verificamos se existe releaseDate e formatamos para uma string YYYY-MM-DD
    if (formattedInput.releaseDate) {
      formattedInput.releaseDate = new Date(formattedInput.releaseDate)
        .toISOString()
        .split('T')[0]
    }

    const { data } = await apolloClient.mutate({
      mutation: UPDATE_MOVIE,
      variables: { input: formattedInput },
    })
    return data.updateMovie
  }

  async deleteMovie(id: string): Promise<boolean> {
    const { data } = await apolloClient.mutate({
      mutation: DELETE_MOVIE,
      variables: { id },
    })
    return data.deleteMovie
  }
}

export const moviesService = new MoviesService()
