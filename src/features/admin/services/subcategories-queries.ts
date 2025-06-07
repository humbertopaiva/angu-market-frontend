// src/features/admin/services/subcategories-queries.ts - CORRIGIDO
import { gql } from '@apollo/client'

export const CREATE_SUBCATEGORY_MUTATION = gql`
  mutation CreateSubcategory($createSubcategoryInput: CreateSubcategoryInput!) {
    createSubcategory(createSubcategoryInput: $createSubcategoryInput) {
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
        segments {
          id
          name
          slug
        }
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

export const UPDATE_SUBCATEGORY_MUTATION = gql`
  mutation UpdateSubcategory($updateSubcategoryInput: UpdateSubcategoryInput!) {
    updateSubcategory(updateSubcategoryInput: $updateSubcategoryInput) {
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
        segments {
          id
          name
          slug
        }
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

export const DELETE_SUBCATEGORY_MUTATION = gql`
  mutation RemoveSubcategory($id: Int!) {
    removeSubcategory(id: $id) {
      id
      name
    }
  }
`

// CORREÇÃO: Query principal sem edges wrapper
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
        segments {
          id
          name
          slug
          color
        }
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

export const GET_SUBCATEGORY_BY_ID_QUERY = gql`
  query GetSubcategory($id: Int!) {
    subcategory(id: $id) {
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
        segments {
          id
          name
          slug
          color
        }
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
        segments {
          id
          name
          slug
          color
        }
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

export const GET_SUBCATEGORIES_BY_CATEGORY_QUERY = gql`
  query GetSubcategoriesByCategory($categoryId: Int!) {
    subcategoriesByCategory(categoryId: $categoryId) {
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
        segments {
          id
          name
          slug
          color
        }
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

export const GET_SUBCATEGORY_BY_SLUG_QUERY = gql`
  query GetSubcategoryBySlug($slug: String!, $placeId: Int!) {
    subcategoryBySlug(slug: $slug, placeId: $placeId) {
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
        segments {
          id
          name
          slug
          color
        }
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
