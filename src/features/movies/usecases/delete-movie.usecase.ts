import { moviesService } from '../services/movies.service'

export class DeleteMovieUseCase {
  async execute(id: string): Promise<boolean> {
    return moviesService.deleteMovie(id)
  }
}

export const deleteMovieUseCase = new DeleteMovieUseCase()
