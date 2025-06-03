export interface Genre {
  id: string
  name: string
}

export enum MovieStatus {
  RELEASED = 'released',
  IN_PRODUCTION = 'in_production',
}

export interface Movie {
  id: string
  title: string
  originalTitle?: string
  description?: string
  tagline?: string
  budget?: number
  revenue?: number
  profit?: number
  releaseDate?: string
  duration?: number
  status?: MovieStatus
  language?: string
  trailerUrl?: string
  popularity?: number
  voteCount?: number
  imageUrl?: string
  imageKey?: string
  backdropUrl?: string
  backdropKey?: string
  rating?: number
  createdBy: {
    id: string
    name: string
  }
  genres: Array<Genre>
  createdAt: string
  updatedAt: string
}

export interface MovieEdge {
  cursor: string
  node: Movie
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface MovieConnection {
  edges: Array<MovieEdge>
  pageInfo: PageInfo
  totalCount: number
}

export interface MovieFilters {
  search?: string
  minDuration?: number
  maxDuration?: number
  releaseDateFrom?: string
  releaseDateTo?: string
  status?: MovieStatus
  language?: string
  genreIds?: Array<string>
}

export interface CreateMovieInput {
  title: string
  originalTitle?: string
  description?: string
  tagline?: string
  budget?: number
  revenue?: number
  profit?: number
  releaseDate?: string
  duration?: number
  status?: MovieStatus
  language?: string
  trailerUrl?: string
  popularity?: number
  voteCount?: number
  genreIds?: Array<string>
  imageUrl?: string
  imageKey?: string
  backdropUrl?: string
  backdropKey?: string
  rating?: number
}

export interface UpdateMovieInput {
  id: string
  title?: string
  originalTitle?: string
  description?: string
  tagline?: string
  budget?: number
  revenue?: number
  profit?: number
  releaseDate?: string
  duration?: number
  status?: MovieStatus
  language?: string
  trailerUrl?: string
  popularity?: number
  voteCount?: number
  genreIds?: Array<string>
  imageUrl?: string
  imageKey?: string
  backdropUrl?: string
  backdropKey?: string
  rating?: number
}
