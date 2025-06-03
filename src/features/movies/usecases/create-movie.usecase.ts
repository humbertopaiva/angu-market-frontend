import { moviesService } from '../services/movies.service'
import type { CreateMovieInput, Movie } from '../model/movie.model'

export class CreateMovieUseCase {
  async execute(input: CreateMovieInput): Promise<Movie> {
    return moviesService.createMovie(input)
  }
}

export const createMovieUseCase = new CreateMovieUseCase()
