// src/features/admin/services/segments-queries.ts - CORRIGIDO
import { gql } from '@apollo/client'

export const CREATE_SEGMENT_MUTATION = gql`
  mutation CreateSegment($createSegmentInput: CreateSegmentInput!) {
    createSegment(createSegmentInput: $createSegmentInput) {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      placeId
      place {
        id
        name
        city
        state
      }
      categories {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_SEGMENT_MUTATION = gql`
  mutation UpdateSegment($updateSegmentInput: UpdateSegmentInput!) {
    updateSegment(updateSegmentInput: $updateSegmentInput) {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      placeId
      place {
        id
        name
        city
        state
      }
      categories {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const DELETE_SEGMENT_MUTATION = gql`
  mutation RemoveSegment($id: Int!) {
    removeSegment(id: $id) {
      id
      name
    }
  }
`

export const GET_SEGMENTS_QUERY = gql`
  query GetSegments {
    segments {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      placeId
      place {
        id
        name
        city
        state
      }
      categories {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_SEGMENT_BY_ID_QUERY = gql`
  query GetSegment($id: Int!) {
    segment(id: $id) {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      placeId
      place {
        id
        name
        city
        state
      }
      categories {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_SEGMENTS_BY_PLACE_QUERY = gql`
  query GetSegmentsByPlace($placeId: Int!) {
    segmentsByPlace(placeId: $placeId) {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      placeId
      place {
        id
        name
        city
        state
      }
      categories {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

// Queries para categorias
export const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      keywords
      placeId
      place {
        id
        name
        city
        state
      }
      segments {
        id
        name
        slug
        color
      }
      subcategories {
        id
        name
        slug
      }
      companies {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_CATEGORIES_BY_PLACE_QUERY = gql`
  query GetCategoriesByPlace($placeId: Int!) {
    categoriesByPlace(placeId: $placeId) {
      id
      uuid
      name
      slug
      description
      icon
      color
      order
      keywords
      placeId
      place {
        id
        name
        city
        state
      }
      segments {
        id
        name
        slug
        color
      }
      subcategories {
        id
        name
        slug
      }
      companies {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

// Queries para subcategorias
export const GET_SUBCATEGORIES_QUERY = gql`
  query GetSubcategories {
    subcategories {
      id
      uuid
      name
      slug
      description
      icon
      order
      keywords
      placeId
      categoryId
      place {
        id
        name
        city
        state
      }
      category {
        id
        name
        slug
        color
      }
      companies {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_SUBCATEGORIES_BY_PLACE_QUERY = gql`
  query GetSubcategoriesByPlace($placeId: Int!) {
    subcategoriesByPlace(placeId: $placeId) {
      id
      uuid
      name
      slug
      description
      icon
      order
      keywords
      placeId
      categoryId
      place {
        id
        name
        city
        state
      }
      category {
        id
        name
        slug
        color
      }
      companies {
        id
        name
        slug
      }
      isActive
      createdAt
      updatedAt
    }
  }
`
