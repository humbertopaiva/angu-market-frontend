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

// CORREÇÃO: Query simples sem estrutura edges/node
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
      isActive
      createdAt
      updatedAt
    }
  }
`
