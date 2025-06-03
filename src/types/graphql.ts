export interface User {
  id: string
  uuid: string
  name: string
  email: string
  phone?: string
  avatar?: string
  isVerified: boolean
  isActive: boolean
  organizationId?: number
  placeId?: number
  companyId?: number
  organization?: Organization
  place?: Place
  company?: Company
  userRoles?: Array<UserRole>
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  logo?: string
  banner?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Place {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  city: string
  state: string
  neighborhood?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  logo?: string
  banner?: string
  organizationId: number
  organization: Organization
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  phone?: string
  email?: string
  website?: string
  address?: string
  latitude?: number
  longitude?: number
  openingHours?: string
  logo?: string
  banner?: string
  cnpj?: string
  placeId: number
  place: Place
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  uuid: string
  name: RoleType
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  id: string
  uuid: string
  userId: number
  roleId: number
  user: User
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
  PLACE_ADMIN = 'PLACE_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPANY_STAFF = 'COMPANY_STAFF',
  PUBLIC_USER = 'PUBLIC_USER',
}

// Auth types
export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface RequestPasswordResetInput {
  email: string
}

export interface RequestPasswordResetResponse {
  success: boolean
  message: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}
