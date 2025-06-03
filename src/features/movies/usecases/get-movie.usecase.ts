import { moviesService } from '../services/movies.service'
import type { Movie } from '../model/movie.model'

export class GetMovieUseCase {
  async execute(id: string): Promise<Movie> {
    return moviesService.getMovie(id)
  }
}

export const getMovieUseCase = new GetMovieUseCase()
