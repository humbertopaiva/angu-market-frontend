import { moviesService } from '../services/movies.service'
import type { Movie, UpdateMovieInput } from '../model/movie.model'

export class UpdateMovieUseCase {
  async execute(input: UpdateMovieInput): Promise<Movie> {
    return moviesService.updateMovie(input)
  }
}

export const updateMovieUseCase = new UpdateMovieUseCase()
