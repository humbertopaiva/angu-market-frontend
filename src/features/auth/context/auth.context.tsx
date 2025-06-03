import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useApolloClient } from '@apollo/client'
import { useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { User } from '../model/auth.model'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export class AuthService {
  saveAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  clearAuth(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  getSavedUser(): User | null {
    const userData = localStorage.getItem('user_data')
    if (!userData) return null

    try {
      return JSON.parse(userData) as User
    } catch (error) {
      console.error('Error parsing user data:', error)
      this.clearAuth()
      return null
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getSavedUser()
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const authService = new AuthService()

  // Adicionando o Apollo Client e Query Client
  const apolloClient = useApolloClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = authService.getSavedUser()
      if (savedUser) {
        setUser(savedUser)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (token: string, userData: User) => {
    authService.saveAuth(token, userData)
    setUser(userData)
    navigate({ to: '/' })
  }

  const logout = () => {
    authService.clearAuth()
    setUser(null)

    apolloClient.resetStore()

    queryClient.clear()

    navigate({ to: '/login' })
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
