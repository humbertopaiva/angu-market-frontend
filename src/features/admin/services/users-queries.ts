import { gql } from '@apollo/client'

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
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
        name
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
  }
`

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
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
        name
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
  }
`

export const DELETE_USER_MUTATION = gql`
  mutation RemoveUser($id: Int!) {
    removeUser(id: $id) {
      id
      name
    }
  }
`

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      edges {
        node {
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
            name
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
      }
    }
  }
`

export const GET_USER_BY_ID_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
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
        name
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
  }
`

export const GET_USERS_BY_PLACE_QUERY = gql`
  query GetUsersByPlace($placeId: Int!) {
    usersByPlace(placeId: $placeId) {
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
        name
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
  }
`
