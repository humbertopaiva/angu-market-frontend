// src/features/admin/services/companies-queries.ts - CORRIGIDO
import { gql } from '@apollo/client'

export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($createCompanyInput: CreateCompanyInput!) {
    createCompany(createCompanyInput: $createCompanyInput) {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        isActive
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const CREATE_COMPANY_WITH_USERS_MUTATION = gql`
  mutation CreateCompanyWithUsers(
    $createCompanyInput: CreateCompanyEnhancedInput!
  ) {
    createCompanyWithUsers(createCompanyInput: $createCompanyInput) {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        isActive
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($updateCompanyInput: UpdateCompanyInput!) {
    updateCompany(updateCompanyInput: $updateCompanyInput) {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        isActive
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const DELETE_COMPANY_MUTATION = gql`
  mutation RemoveCompany($id: Int!) {
    removeCompany(id: $id)
  }
`

// CORREÇÃO: Query principal das empresas com usuários e roles completos
export const GET_COMPANIES_QUERY = gql`
  query GetCompanies {
    companies {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        avatar
        isActive
        isVerified
        companyId
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_COMPANY_BY_ID_QUERY = gql`
  query GetCompany($id: ID!) {
    company(id: $id) {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        avatar
        isActive
        isVerified
        companyId
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const GET_COMPANIES_BY_PLACE_QUERY = gql`
  query GetCompaniesByPlace($placeId: Int!) {
    companiesByPlace(placeId: $placeId) {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        avatar
        isActive
        isVerified
        companyId
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

// ADIÇÃO: Query específica para obter empresa com detalhes completos dos usuários
export const GET_COMPANY_WITH_USERS_QUERY = gql`
  query GetCompanyWithUsers($id: Int!) {
    companyDetails(id: $id) {
      id
      uuid
      name
      slug
      description
      phone
      email
      website
      address
      latitude
      longitude
      openingHours
      logo
      banner
      cnpj
      placeId
      place {
        id
        name
        city
        state
      }
      users {
        id
        uuid
        name
        email
        phone
        avatar
        isActive
        isVerified
        companyId
        company {
          id
          name
        }
        userRoles {
          id
          isActive
          role {
            id
            name
            description
          }
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

export const ASSIGN_COMPANY_TO_SEGMENT_MUTATION = gql`
  mutation AssignCompanyToSegment($companyId: Int!, $segmentId: Int!) {
    assignCompanyToSegment(companyId: $companyId, segmentId: $segmentId) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

export const ASSIGN_COMPANY_TO_CATEGORY_MUTATION = gql`
  mutation AssignCompanyToCategory($companyId: Int!, $categoryId: Int!) {
    assignCompanyToCategory(companyId: $companyId, categoryId: $categoryId) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

export const ASSIGN_COMPANY_TO_SUBCATEGORY_MUTATION = gql`
  mutation AssignCompanyToSubcategory($companyId: Int!, $subcategoryId: Int!) {
    assignCompanyToSubcategory(
      companyId: $companyId
      subcategoryId: $subcategoryId
    ) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

export const REMOVE_COMPANY_FROM_SEGMENTATION_MUTATION = gql`
  mutation RemoveCompanyFromSegmentation($companyId: Int!) {
    removeCompanyFromSegmentation(companyId: $companyId) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

// QUERIES AUXILIARES
export const GET_COMPANIES_WITHOUT_SEGMENTATION_QUERY = gql`
  query GetCompaniesWithoutSegmentation($placeId: Int) {
    companiesWithoutSegmentation(placeId: $placeId) {
      id
      name
      slug
      description
      placeId
      place {
        id
        name
        city
        state
      }
      isActive
    }
  }
`

export const GET_SEGMENTATION_DATA_FOR_PLACE_QUERY = gql`
  query GetSegmentationDataForPlace($placeId: Int!) {
    segmentsByPlace(placeId: $placeId) {
      id
      name
      slug
      color
      description
      order
      isActive
    }
    categoriesByPlace(placeId: $placeId) {
      id
      name
      slug
      color
      description
      order
      isActive
      segments {
        id
        name
        color
      }
    }
    subcategoriesByPlace(placeId: $placeId) {
      id
      name
      slug
      description
      order
      isActive
      category {
        id
        name
        color
        segments {
          id
          name
          color
        }
      }
    }
  }
`
