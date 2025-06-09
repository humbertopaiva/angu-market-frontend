// src/features/admin/services/companies-queries.ts - CORRIGIDO COM SEGMENTAÇÃO COMPLETA
import { gql } from '@apollo/client'

// Fragment comum para segmentação completa
const COMPANY_SEGMENTATION_FRAGMENT = gql`
  fragment CompanySegmentation on Company {
    segmentId
    categoryId
    subcategoryId
    segment {
      id
      name
      slug
      color
      order
    }
    category {
      id
      name
      slug
      color
      order
      segments {
        id
        name
        slug
        color
      }
    }
    subcategory {
      id
      name
      slug
      order
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
    }
  }
`

// Fragment comum para dados básicos da empresa
const COMPANY_BASE_FRAGMENT = gql`
  fragment CompanyBase on Company {
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
    isActive
    createdAt
    updatedAt
  }
`

// Fragment para usuários completos
const COMPANY_USERS_FRAGMENT = gql`
  fragment CompanyUsers on Company {
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
  }
`

export const CREATE_COMPANY_MUTATION = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  mutation CreateCompany($createCompanyInput: CreateCompanyInput!) {
    createCompany(createCompanyInput: $createCompanyInput) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const CREATE_COMPANY_WITH_USERS_MUTATION = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  mutation CreateCompanyWithUsers(
    $createCompanyInput: CreateCompanyEnhancedInput!
  ) {
    createCompanyWithUsers(createCompanyInput: $createCompanyInput) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const UPDATE_COMPANY_MUTATION = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  mutation UpdateCompany($updateCompanyInput: UpdateCompanyInput!) {
    updateCompany(updateCompanyInput: $updateCompanyInput) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const DELETE_COMPANY_MUTATION = gql`
  mutation RemoveCompany($id: Int!) {
    removeCompany(id: $id)
  }
`

// CORREÇÃO PRINCIPAL: Query completa das empresas com toda a segmentação
export const GET_COMPANIES_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompanies {
    companies {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const GET_COMPANY_BY_ID_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompany($id: ID!) {
    company(id: $id) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const GET_COMPANIES_BY_PLACE_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompaniesByPlace($placeId: Int!) {
    companiesByPlace(placeId: $placeId) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

// Query específica para obter empresa com detalhes completos dos usuários
export const GET_COMPANY_WITH_USERS_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  query GetCompanyWithUsers($id: Int!) {
    companyDetails(id: $id) {
      ...CompanyBase
      ...CompanySegmentation
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
    }
  }
`

// Mutations de segmentação
export const ASSIGN_COMPANY_TO_SEGMENT_MUTATION = gql`
  ${COMPANY_SEGMENTATION_FRAGMENT}
  mutation AssignCompanyToSegment($companyId: Int!, $segmentId: Int!) {
    assignCompanyToSegment(companyId: $companyId, segmentId: $segmentId) {
      id
      name
      ...CompanySegmentation
    }
  }
`

export const ASSIGN_COMPANY_TO_CATEGORY_MUTATION = gql`
  ${COMPANY_SEGMENTATION_FRAGMENT}
  mutation AssignCompanyToCategory($companyId: Int!, $categoryId: Int!) {
    assignCompanyToCategory(companyId: $companyId, categoryId: $categoryId) {
      id
      name
      ...CompanySegmentation
    }
  }
`

export const ASSIGN_COMPANY_TO_SUBCATEGORY_MUTATION = gql`
  ${COMPANY_SEGMENTATION_FRAGMENT}
  mutation AssignCompanyToSubcategory($companyId: Int!, $subcategoryId: Int!) {
    assignCompanyToSubcategory(
      companyId: $companyId
      subcategoryId: $subcategoryId
    ) {
      id
      name
      ...CompanySegmentation
    }
  }
`

export const REMOVE_COMPANY_FROM_SEGMENTATION_MUTATION = gql`
  ${COMPANY_SEGMENTATION_FRAGMENT}
  mutation RemoveCompanyFromSegmentation($companyId: Int!) {
    removeCompanyFromSegmentation(companyId: $companyId) {
      id
      name
      ...CompanySegmentation
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

// Queries por segmentação
export const GET_COMPANIES_BY_SEGMENT_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompaniesBySegment($segmentId: Int!) {
    companiesBySegment(segmentId: $segmentId) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const GET_COMPANIES_BY_CATEGORY_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompaniesByCategory($categoryId: Int!) {
    companiesByCategory(categoryId: $categoryId) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const GET_COMPANIES_BY_SUBCATEGORY_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompaniesBySubcategory($subcategoryId: Int!) {
    companiesBySubcategory(subcategoryId: $subcategoryId) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`
