import type { User } from '@/types/graphql'
import { RoleType } from '@/types/graphql'

export function hasRole(user: User | null, role: RoleType): boolean {
  if (!user || !user.userRoles) return false

  return user.userRoles.some((userRole) => userRole.role.name === role)
}

export function hasAnyRole(user: User | null, roles: Array<RoleType>): boolean {
  if (!user || !user.userRoles) return false

  return user.userRoles.some((userRole) => roles.includes(userRole.role.name))
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, RoleType.SUPER_ADMIN)
}

export function isOrganizationAdmin(user: User | null): boolean {
  return hasRole(user, RoleType.ORGANIZATION_ADMIN)
}

export function isPlaceAdmin(user: User | null): boolean {
  return hasRole(user, RoleType.PLACE_ADMIN)
}

export function isCompanyAdmin(user: User | null): boolean {
  return hasRole(user, RoleType.COMPANY_ADMIN)
}

export function canManagePlaces(user: User | null): boolean {
  return hasAnyRole(user, [RoleType.SUPER_ADMIN, RoleType.ORGANIZATION_ADMIN])
}

export function canManageUsers(user: User | null): boolean {
  return hasAnyRole(user, [
    RoleType.SUPER_ADMIN,
    RoleType.ORGANIZATION_ADMIN,
    RoleType.PLACE_ADMIN,
  ])
}

export function canManageCompanies(user: User | null): boolean {
  return hasAnyRole(user, [
    RoleType.SUPER_ADMIN,
    RoleType.ORGANIZATION_ADMIN,
    RoleType.PLACE_ADMIN,
  ])
}
