import { moviesService } from '../services/movies.service'
import type { MovieConnection, MovieFilters } from '../model/movie.model'

export class GetMoviesUseCase {
  async execute(
    filters?: MovieFilters,
    pagination?: {
      page?: number
      pageSize?: number
      after?: string
      orderBy?: { field: string; direction: 'ASC' | 'DESC' }
    },
  ): Promise<MovieConnection> {
    return moviesService.getMovies(filters, pagination)
  }
}

export const getMoviesUseCase = new GetMoviesUseCase()
