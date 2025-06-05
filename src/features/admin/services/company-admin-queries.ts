import { gql } from '@apollo/client'

export const ASSIGN_COMPANY_ADMIN_MUTATION = gql`
  mutation AssignCompanyAdmin($companyId: Int!, $userId: Int!) {
    assignCompanyAdmin(companyId: $companyId, userId: $userId) {
      id
      name
      slug
      users {
        id
        name
        email
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
  }
`

export const REMOVE_COMPANY_ADMIN_MUTATION = gql`
  mutation RemoveCompanyAdmin($companyId: Int!, $userId: Int!) {
    removeCompanyAdmin(companyId: $companyId, userId: $userId) {
      id
      name
      slug
      users {
        id
        name
        email
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
  }
`

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
        slug
      }
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
