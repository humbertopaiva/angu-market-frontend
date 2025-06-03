import { gql } from '@apollo/client'

export const MOVIE_FRAGMENT = gql`
  fragment MovieFields on Movie {
    id
    title
    originalTitle
    description
    tagline
    budget
    revenue
    profit
    releaseDate
    duration
    status
    language
    trailerUrl
    popularity
    voteCount
    imageUrl
    imageKey
    backdropUrl
    backdropKey
    rating
    createdAt
    updatedAt
    createdBy {
      id
      name
    }
    genres {
      id
      name
    }
  }
`

export const GET_MOVIES = gql`
  query GetMovies(
    $filters: MovieFiltersInput
    $pagination: MoviesPaginationInput
  ) {
    movies(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...MovieFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  ${MOVIE_FRAGMENT}
`

export const GET_MOVIE = gql`
  query GetMovie($id: ID!) {
    movie(id: $id) {
      ...MovieFields
    }
  }
  ${MOVIE_FRAGMENT}
`

export const GET_GENRES = gql`
  query GetGenres {
    genres {
      id
      name
    }
  }
`

export const CREATE_MOVIE = gql`
  mutation CreateMovie($input: CreateMovieInput!) {
    createMovie(input: $input) {
      ...MovieFields
    }
  }
  ${MOVIE_FRAGMENT}
`

export const UPDATE_MOVIE = gql`
  mutation UpdateMovie($input: UpdateMovieInput!) {
    updateMovie(input: $input) {
      ...MovieFields
    }
  }
  ${MOVIE_FRAGMENT}
`

export const DELETE_MOVIE = gql`
  mutation DeleteMovie($id: ID!) {
    deleteMovie(id: $id)
  }
`
