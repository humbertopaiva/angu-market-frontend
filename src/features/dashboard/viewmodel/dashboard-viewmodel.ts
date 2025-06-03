import { useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { AuthService } from '@/features/auth/services/auth-service'
import { useAuthStore } from '@/features/auth/stores/auth-store'

export class DashboardViewModel {
  private authService: AuthService
  private setUser: (user: any) => void
  private setLoading: (loading: boolean) => void
  private navigate: ReturnType<typeof useNavigate>

  constructor(
    authService: AuthService,
    setUser: (user: any) => void,
    setLoading: (loading: boolean) => void,
    navigate: ReturnType<typeof useNavigate>,
  ) {
    this.authService = authService
    this.setUser = setUser
    this.setLoading = setLoading
    this.navigate = navigate
  }

  async loadCurrentUser(): Promise<void> {
    try {
      this.setLoading(true)
      const user = await this.authService.getCurrentUser()
      this.setUser(user)
    } catch (error: any) {
      console.error('Error loading current user:', error)

      // Se o erro for de autenticação, fazer logout
      if (error?.networkError?.statusCode === 401) {
        await this.logout()
      } else {
        toast.error('Erro ao carregar dados', {
          description: 'Não foi possível carregar suas informações.',
        })
      }
    } finally {
      this.setLoading(false)
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout()
      this.setUser(null)
      this.navigate({ to: '/auth/login' })

      toast.success('Logout realizado', {
        description: 'Você foi desconectado com sucesso.',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}

export function useDashboardViewModel() {
  const { setUser, setLoading } = useAuthStore()
  const navigate = useNavigate()
  const authService = new AuthService()

  const viewModel = new DashboardViewModel(
    authService,
    setUser,
    setLoading,
    navigate,
  )

  return viewModel
}
