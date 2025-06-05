// src/types/graphql.ts - COMPLETE AND UPDATED

// ===== USER TYPES =====
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
  places?: Array<Place>
  users?: Array<User>
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
  companies?: Array<Company>
  users?: Array<User>
  segments?: Array<Segment>
  categories?: Array<Category>
  subcategories?: Array<Subcategory>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ===== COMPANY TYPES =====
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
  tags?: string
  categoryId?: number
  subcategoryId?: number
  placeId: number
  place: Place
  category?: Category
  subcategory?: Subcategory
  users?: Array<User>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyUserInput {
  existingUserId?: number
  name?: string
  email?: string
  password?: string
  phone?: string
  role?: 'COMPANY_ADMIN' | 'COMPANY_STAFF'
  isActive?: boolean
}

// Company Input types
export interface CreateCompanyInput {
  name: string
  slug: string
  description: string
  placeId: number
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
  isActive?: boolean
  users?: Array<CreateCompanyUserInput>
}

export interface UpdateCompanyInput extends CreateCompanyInput {
  id: number
}

// ===== SEGMENTATION TYPES =====
export interface Segment {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  icon?: string
  color?: string
  order: number
  placeId: number
  place: Place
  categories?: Array<Category>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  icon?: string
  color?: string
  order: number
  keywords?: string
  placeId: number
  place: Place
  segments?: Array<Segment>
  subcategories?: Array<Subcategory>
  companies?: Array<Company>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Subcategory {
  id: string
  uuid: string
  name: string
  slug: string
  description: string
  icon?: string
  order: number
  keywords?: string
  placeId: number
  categoryId: number
  place: Place
  category: Category
  companies?: Array<Company>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ===== ROLE TYPES =====
export interface Role {
  id: string
  uuid: string
  name: RoleType
  description: string
  isActive: boolean
  userRoles?: Array<UserRole>
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

// ===== AUTH TYPES =====
export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// Company Login types
export interface CompanyLoginInput {
  companySlug: string
  email: string
  password: string
}

export interface CompanyAuthResponse {
  accessToken: string
  user: User
  company: Company
}

export interface SignUpInput {
  name: string
  email: string
  password: string
  passwordConfirmation: string
  securityToken: string
}

export interface SignUpResponse {
  success: boolean
  message: string
  userId?: number
}

export interface VerifyEmailInput {
  token: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface ResendVerificationInput {
  email: string
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

// ===== CREATE USER INPUT TYPES =====
export interface CreateUserInput {
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  organizationId?: number
  placeId?: number
  companyId?: number
  roleIds?: Array<number>
  isActive?: boolean
}

export interface UpdateUserInput {
  id: number
  name?: string
  phone?: string
  avatar?: string
  organizationId?: number
  placeId?: number
  companyId?: number
  roleIds?: Array<number>
  isActive?: boolean
}

// ===== CREATE PLACE INPUT TYPES =====
export interface CreatePlaceInput {
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
  isActive?: boolean
}

export interface UpdatePlaceInput extends CreatePlaceInput {
  id: number
}

// ===== ROLE ASSIGNMENT TYPES =====
export interface AssignRoleInput {
  userId: number
  roleId: number
}

export interface CreateRoleInput {
  name: RoleType
  description: string
  isActive?: boolean
}

// ===== SEGMENTATION INPUT TYPES =====
export interface CreateSegmentInput {
  name: string
  slug: string
  description: string
  placeId: number
  icon?: string
  color?: string
  order?: number
  isActive?: boolean
  categoryIds?: Array<number>
}

export interface UpdateSegmentInput extends CreateSegmentInput {
  id: number
}

export interface CreateCategoryInput {
  name: string
  slug: string
  description: string
  placeId: number
  icon?: string
  color?: string
  order?: number
  keywords?: string
  isActive?: boolean
  segmentIds?: Array<number>
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: number
}

export interface CreateSubcategoryInput {
  name: string
  slug: string
  description: string
  placeId: number
  categoryId: number
  icon?: string
  order?: number
  keywords?: string
  isActive?: boolean
}

export interface UpdateSubcategoryInput extends CreateSubcategoryInput {
  id: number
}

// ===== QUERY FILTER TYPES =====
export interface UserFilter {
  name?: string
  email?: string
  isActive?: boolean
  placeId?: number
  companyId?: number
  roleId?: number
}

export interface CompanyFilter {
  name?: string
  slug?: string
  placeId?: number
  categoryId?: number
  subcategoryId?: number
  isActive?: boolean
}

export interface PlaceFilter {
  name?: string
  city?: string
  state?: string
  organizationId?: number
  isActive?: boolean
}

// ===== PAGINATION TYPES =====
export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface Connection<T> {
  edges: Array<{
    node: T
    cursor: string
  }>
  pageInfo: PageInfo
}

export interface PaginationInput {
  first?: number
  last?: number
  after?: string
  before?: string
}

// ===== AGGREGATE TYPES =====
export interface CountAggregate {
  [key: string]: number
}

export interface AggregateResponse<T> {
  count?: T
  avg?: T
  sum?: T
  min?: T
  max?: T
}

// ===== MUTATION RESPONSE TYPES =====
export interface MutationResponse {
  success: boolean
  message: string
}

export interface DeleteManyResponse {
  deletedCount: number
}

export interface UpdateManyResponse {
  updatedCount: number
}

// ===== SORT TYPES =====
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface SortInput {
  field: string
  direction: SortDirection
}

// ===== ERROR TYPES =====
export interface GraphQLError {
  message: string
  path?: Array<string | number>
  extensions?: {
    code?: string
    [key: string]: any
  }
}

export interface NetworkError {
  message: string
  statusCode?: number
  response?: any
}

// ===== UTILITY TYPES =====
export type ID = string | number

export interface Node {
  id: ID
}

export interface Timestamped {
  createdAt: string
  updatedAt: string
}

export interface SoftDeletable {
  deletedAt?: string
}

// Union types for entities that can be active/inactive
export type ActiveEntity =
  | User
  | Company
  | Place
  | Organization
  | Role
  | Segment
  | Category
  | Subcategory

// Union types for entities with UUID
export type UUIDEntity =
  | User
  | Company
  | Place
  | Organization
  | Role
  | UserRole
  | Segment
  | Category
  | Subcategory
