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

// CORREÇÃO: Função para verificar se pode acessar painel administrativo
export function canAccessAdmin(user: User | null): boolean {
  return hasAnyRole(user, [
    RoleType.SUPER_ADMIN,
    RoleType.ORGANIZATION_ADMIN,
    RoleType.PLACE_ADMIN,
  ])
}

// Nova função para verificar se pode criar empresas em um place específico
export function canCreateCompanyInPlace(
  user: User | null,
  placeId?: number,
): boolean {
  if (!user) return false

  // Super Admin pode criar em qualquer place
  if (isSuperAdmin(user)) return true

  // Place Admin só pode criar empresas em seu próprio place
  if (isPlaceAdmin(user)) {
    return user.placeId === placeId
  }

  return false
}

// Nova função para verificar se pode editar/deletar uma empresa específica
export function canManageSpecificCompany(
  user: User | null,
  companyPlaceId: number,
): boolean {
  if (!user) return false

  // Super Admin pode gerenciar qualquer empresa
  if (isSuperAdmin(user)) return true

  // Place Admin só pode gerenciar empresas de seu place
  if (isPlaceAdmin(user)) {
    return user.placeId === companyPlaceId
  }

  return false
}
