export interface User {
  id: string
  name: string
  email: string
}

export interface AuthPayload {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}
