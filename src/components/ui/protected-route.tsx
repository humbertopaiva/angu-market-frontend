import React from 'react'
import { Navigate } from '@tanstack/react-router'
import type { RoleType } from '@/types/graphql'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { hasAnyRole } from '@/utils/role-helpers'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: Array<RoleType>
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallbackPath = '/dashboard',
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" />
  }

  if (requiredRoles && !hasAnyRole(user, requiredRoles)) {
    return <Navigate to={fallbackPath} />
  }

  return <>{children}</>
}
