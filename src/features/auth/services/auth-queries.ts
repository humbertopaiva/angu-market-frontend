import { gql } from '@apollo/client'

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
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
    }
  }
`

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($signUpInput: SignUpInput!) {
    signUp(signUpInput: $signUpInput) {
      success
      message
      userId
    }
  }
`

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($verifyEmailInput: VerifyEmailInput!) {
    verifyEmail(verifyEmailInput: $verifyEmailInput) {
      success
      message
    }
  }
`

export const RESEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation ResendVerificationEmail(
    $resendVerificationInput: ResendVerificationInput!
  ) {
    resendVerificationEmail(resendVerificationInput: $resendVerificationInput) {
      success
      message
    }
  }
`

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset(
    $requestPasswordResetInput: RequestPasswordResetInput!
  ) {
    requestPasswordReset(
      requestPasswordResetInput: $requestPasswordResetInput
    ) {
      success
      message
    }
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($resetPasswordInput: ResetPasswordInput!) {
    resetPassword(resetPasswordInput: $resetPasswordInput) {
      success
      message
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
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
  }
`
