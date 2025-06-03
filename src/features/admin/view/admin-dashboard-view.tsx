import React from 'react'
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import {
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useDashboardViewModel } from '@/features/dashboard/viewmodel/dashboard-viewmodel'

const navigationItems = [
  {
    title: 'Visão Geral',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Places',
    href: '/admin/places',
    icon: Building2,
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users,
  },
]

export function AdminDashboardView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const dashboardViewModel = useDashboardViewModel()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    dashboardViewModel.logout()
  }

  const handleBackToDashboard = () => {
    navigate({ to: '/dashboard' })
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isCurrentPath = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            Painel Administrativo
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToDashboard}
            className="hidden sm:flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleBackToDashboard}
                className="sm:hidden"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Voltar ao Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 pt-16 
          transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <nav className="h-full px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isCurrentPath(item.href)

              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-2 ${
                    isActive ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : ''
                  }`}
                  onClick={() => {
                    navigate({ to: item.href as any })
                    setIsSidebarOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              )
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
