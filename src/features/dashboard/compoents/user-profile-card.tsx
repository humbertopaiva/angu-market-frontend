import {
  Briefcase,
  Building,
  Calendar,
  LogOut,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import type { User } from '@/types/graphql'
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

interface UserProfileCardProps {
  user: User
  onLogout: () => void
  getUserInitials: (name: string) => string
  formatDate: (date: string) => string
}

export function UserProfileCard({
  user,
  onLogout,
  getUserInitials,
  formatDate,
}: UserProfileCardProps) {
  const getRoleDisplayName = (roleName: string) => {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      ORGANIZATION_ADMIN: 'Admin da Organização',
      PLACE_ADMIN: 'Admin do Local',
      COMPANY_ADMIN: 'Admin da Empresa',
      COMPANY_STAFF: 'Funcionário',
      PUBLIC_USER: 'Usuário Público',
    }
    return roleMap[roleName] || roleName
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center space-y-0 space-x-4 pb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-lg font-semibold">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {user.name}
          </CardTitle>
          <p className="text-gray-600 mt-1">
            {user.userRoles?.[0]?.role?.name &&
              getRoleDisplayName(user.userRoles[0].role.name)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.isVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {user.isVerified ? 'Verificado' : 'Não verificado'}
            </span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.isActive
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {user.isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações de contato */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Informações de contato
          </h3>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informações organizacionais */}
        {(user.organization || user.place || user.company) && (
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Informações organizacionais
            </h3>

            <div className="grid gap-3">
              {user.organization && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <span className="text-gray-700 font-medium">
                      {user.organization.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {user.organization.description}
                    </p>
                  </div>
                </div>
              )}

              {user.place && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <span className="text-gray-700 font-medium">
                      {user.place.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {user.place.city}, {user.place.state}
                    </p>
                  </div>
                </div>
              )}

              {user.company && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <div>
                    <span className="text-gray-700 font-medium">
                      {user.company.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {user.company.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações da conta */}
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Informações da conta
          </h3>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <span className="text-gray-700 font-medium">Membro desde</span>
                <p className="text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
