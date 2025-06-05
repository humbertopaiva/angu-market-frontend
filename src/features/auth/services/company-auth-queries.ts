// src/features/auth/services/company-auth-queries.ts
import { gql } from '@apollo/client'

export const COMPANY_LOGIN_MUTATION = gql`
  mutation CompanyLogin($companyLoginInput: CompanyLoginInput!) {
    companyLogin(companyLoginInput: $companyLoginInput) {
      accessToken
      user {
        id
        uuid
        name
        email
        phone
        avatar
        isVerified
        isActive
        organizationId
        placeId
        companyId
        organization {
          id
          uuid
          name
          slug
          description
          logo
          banner
        }
        place {
          id
          uuid
          name
          slug
          description
          city
          state
        }
        company {
          id
          uuid
          name
          slug
          description
        }
        userRoles {
          id
          role {
            id
            name
            description
          }
        }
        createdAt
        updatedAt
      }
      company {
        id
        uuid
        name
        slug
        description
        phone
        email
        website
        address
        logo
        banner
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
      isVerified
      isActive
      userRoles {
        id
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
`
