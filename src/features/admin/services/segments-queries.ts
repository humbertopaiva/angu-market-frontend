// src/features/admin/services/segments-queries.ts
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
        subcategories {
          id
          name
          slug
        }
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
        subcategories {
          id
          name
          slug
        }
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
      edges {
        node {
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
            order
            subcategories {
              id
              name
              slug
              order
            }
          }
          isActive
          createdAt
          updatedAt
        }
      }
    }
  }
`

export const GET_SEGMENT_BY_ID_QUERY = gql`
  query GetSegment($id: ID!) {
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
        order
        subcategories {
          id
          name
          slug
          order
        }
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
        order
        subcategories {
          id
          name
          slug
          order
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_SEGMENT_BY_SLUG_QUERY = gql`
  query GetSegmentBySlug($slug: String!, $placeId: Int!) {
    segmentBySlug(slug: $slug, placeId: $placeId) {
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
        order
        subcategories {
          id
          name
          slug
          order
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`
