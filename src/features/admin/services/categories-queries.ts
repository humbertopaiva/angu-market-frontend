// src/features/admin/services/categories-queries.ts - CORRIGIDO
import { gql } from '@apollo/client'

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($createCategoryInput: CreateCategoryInput!) {
    createCategory(createCategoryInput: $createCategoryInput) {
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
        order
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

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($updateCategoryInput: UpdateCategoryInput!) {
    updateCategory(updateCategoryInput: $updateCategoryInput) {
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
        order
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

export const DELETE_CATEGORY_MUTATION = gql`
  mutation RemoveCategory($id: Int!) {
    removeCategory(id: $id) {
      id
      name
    }
  }
`

// CORREÇÃO: Query principal sem edges wrapper
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
        order
      }
      subcategories {
        id
        name
        slug
        order
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

export const GET_CATEGORY_BY_ID_QUERY = gql`
  query GetCategory($id: Int!) {
    category(id: $id) {
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
        order
      }
      subcategories {
        id
        name
        slug
        order
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
        order
      }
      subcategories {
        id
        name
        slug
        order
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

export const GET_CATEGORIES_BY_SEGMENT_QUERY = gql`
  query GetCategoriesBySegment($segmentId: Int!) {
    categoriesBySegment(segmentId: $segmentId) {
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
        order
      }
      subcategories {
        id
        name
        slug
        order
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

export const GET_CATEGORY_BY_SLUG_QUERY = gql`
  query GetCategoryBySlug($slug: String!, $placeId: Int!) {
    categoryBySlug(slug: $slug, placeId: $placeId) {
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
        order
      }
      subcategories {
        id
        name
        slug
        order
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
