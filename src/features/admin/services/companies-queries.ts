// src/features/admin/services/companies-queries.ts

import { gql } from '@apollo/client'

// Fragment para dados básicos da empresa
export const COMPANY_BASE_FRAGMENT = gql`
  fragment CompanyBase on Company {
    id
    uuid
    name
    slug
    description
    phone
    email
    website
    logo
    banner
    isActive
    isVerified
    createdAt
    updatedAt
    placeId
    place {
      id
      name
      slug
      city
      state
    }
  }
`

// Fragment para segmentação - EXPORTADO
export const COMPANY_SEGMENTATION_FRAGMENT = gql`
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
    }
    subcategory {
      id
      name
      slug
      order
    }
  }
`

// Fragment para usuários
export const COMPANY_USERS_FRAGMENT = gql`
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
        isActive
        role {
          id
          name
          description
        }
      }
    }
  }
`

// ===== QUERIES PRINCIPAIS =====

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

export const GET_COMPANY_BY_ID_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompany($id: Int!) {
    company(id: $id) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const GET_COMPANY_BY_SLUG_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetCompanyBySlug($slug: String!) {
    companyBySlug(slug: $slug) {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

export const GET_MY_COMPANIES_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  query GetMyCompanies {
    myCompanies {
      ...CompanyBase
      ...CompanySegmentation
      ...CompanyUsers
    }
  }
`

// ===== QUERIES POR SEGMENTAÇÃO =====

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

// ===== MUTATIONS PRINCIPAIS =====

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
  mutation CreateCompanyWithUsers($createCompanyInput: CreateCompanyEnhancedInput!) {
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

// ===== MUTATIONS DE SEGMENTAÇÃO =====

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
    assignCompanyToSubcategory(companyId: $companyId, subcategoryId: $subcategoryId) {
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

// ===== MUTATIONS DE ADMINISTRAÇÃO =====

export const ASSIGN_COMPANY_ADMIN_MUTATION = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  mutation AssignCompanyAdmin($companyId: Int!, $userId: Int!) {
    assignCompanyAdmin(companyId: $companyId, userId: $userId) {
      ...CompanyBase
      ...CompanyUsers
    }
  }
`

export const REMOVE_COMPANY_ADMIN_MUTATION = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_USERS_FRAGMENT}
  mutation RemoveCompanyAdmin($companyId: Int!, $userId: Int!) {
    removeCompanyAdmin(companyId: $companyId, userId: $userId) {
      ...CompanyBase
      ...CompanyUsers
    }
  }
`

// ===== QUERIES DE USUÁRIOS DISPONÍVEIS =====

export const GET_AVAILABLE_COMPANY_ADMINS_QUERY = gql`
  query GetAvailableCompanyAdmins($placeId: Int!) {
    availableCompanyAdmins(placeId: $placeId) {
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
`

export const GET_AVAILABLE_USERS_FOR_COMPANY_QUERY = gql`
  query GetAvailableUsersForCompany($placeId: Int!) {
    availableUsersForCompany(placeId: $placeId) {
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
`

// ===== QUERIES DE ESTATÍSTICAS =====

export const GET_COMPANIES_WITHOUT_ADMIN_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  query GetCompaniesWithoutAdmin($placeId: Int) {
    companiesWithoutAdmin(placeId: $placeId) {
      ...CompanyBase
      ...CompanySegmentation
    }
  }
`

export const GET_COMPANIES_WITHOUT_SEGMENTATION_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  query GetCompaniesWithoutSegmentation($placeId: Int) {
    companiesWithoutSegmentation(placeId: $placeId) {
      ...CompanyBase
      ...CompanySegmentation
    }
  }
`

// ===== QUERIES DE DADOS DE SEGMENTAÇÃO =====

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
      placeId
    }
    categoriesByPlace(placeId: $placeId) {
      id
      name
      slug
      color
      description
      order
      isActive
      placeId
      segments {
        id
        name
        slug
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
      placeId
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

// ===== QUERY DETALHADA DE EMPRESA COM USUÁRIOS =====

export const GET_COMPANY_WITH_USERS_QUERY = gql`
  ${COMPANY_BASE_FRAGMENT}
  ${COMPANY_SEGMENTATION_FRAGMENT}
  query GetCompanyWithUsers($id: Int!) {
    companyDetails: company(id: $id) {
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
        createdAt
        updatedAt
      }
    }
  }
`