import { create } from 'zustand'
import type { User } from '@/types/graphql'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setAuthenticated: (authenticated: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
    })),

  setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),

  setAuthenticated: (isAuthenticated) =>
    set((state) => ({ ...state, isAuthenticated })),

  reset: () =>
    set({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }),
}))
