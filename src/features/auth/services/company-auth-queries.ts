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
          name
        }
        place {
          id
          name
          city
          state
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
          isActive
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
