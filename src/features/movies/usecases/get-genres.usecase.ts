import { moviesService } from '../services/movies.service'
import type { Genre } from '../model/movie.model'

export class GetGenresUseCase {
  async execute(): Promise<Array<Genre>> {
    return moviesService.getGenres()
  }
}

export const getGenresUseCase = new GetGenresUseCase()
