import { gql } from '@apollo/client'

export const CREATE_PLACE_MUTATION = gql`
  mutation CreatePlace($createPlaceInput: CreatePlaceInput!) {
    createPlace(createPlaceInput: $createPlaceInput) {
      id
      uuid
      name
      slug
      description
      city
      state
      neighborhood
      postalCode
      latitude
      longitude
      logo
      banner
      organizationId
      organization {
        id
        name
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_PLACE_MUTATION = gql`
  mutation UpdatePlace($updatePlaceInput: UpdatePlaceInput!) {
    updatePlace(updatePlaceInput: $updatePlaceInput) {
      id
      uuid
      name
      slug
      description
      city
      state
      neighborhood
      postalCode
      latitude
      longitude
      logo
      banner
      organizationId
      organization {
        id
        name
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const DELETE_PLACE_MUTATION = gql`
  mutation RemovePlace($id: Int!) {
    removePlace(id: $id) {
      id
      name
    }
  }
`

export const GET_PLACES_QUERY = gql`
  query GetPlaces {
    places {
      edges {
        node {
          id
          uuid
          name
          slug
          description
          city
          state
          neighborhood
          postalCode
          latitude
          longitude
          logo
          banner
          organizationId
          organization {
            id
            name
          }
          isActive
          createdAt
          updatedAt
        }
      }
    }
  }
`

export const GET_PLACE_BY_ID_QUERY = gql`
  query GetPlace($id: ID!) {
    place(id: $id) {
      id
      uuid
      name
      slug
      description
      city
      state
      neighborhood
      postalCode
      latitude
      longitude
      logo
      banner
      organizationId
      organization {
        id
        name
      }
      isActive
      createdAt
      updatedAt
    }
  }
`
