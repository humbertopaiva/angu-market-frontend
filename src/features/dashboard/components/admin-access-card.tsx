import React from 'react'
import { ArrowRight, Building, Settings, Shield } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import {
  canAccessAdmin,
  isPlaceAdmin,
  isSuperAdmin,
} from '@/utils/role-helpers'

export function AdminAccessCard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // CORREÇÃO: Verificar se pode acessar admin (incluindo place admin)
  if (!user || !canAccessAdmin(user)) {
    return null
  }

  const handleGoToAdmin = () => {
    navigate({ to: '/admin' })
  }

  // CORREÇÃO: Determinar título e descrição baseado no tipo de admin
  const getCardContent = () => {
    if (isSuperAdmin(user)) {
      return {
        title: 'Acesso Super Administrativo',
        description:
          'Como Super Administrador, você tem acesso completo ao painel administrativo para gerenciar places, usuários e configurações do sistema.',
        icon: Shield,
        color: 'from-orange-50 to-amber-50 border-orange-200',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-800',
        descColor: 'text-orange-700',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
      }
    } else if (isPlaceAdmin(user)) {
      return {
        title: 'Painel do Place',
        description: `Como Administrador do Place, você pode gerenciar empresas, usuários e configurações do ${user.place?.name || 'seu place'}.`,
        icon: Building,
        color: 'from-blue-50 to-indigo-50 border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        descColor: 'text-blue-700',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
      }
    } else {
      return {
        title: 'Painel Administrativo',
        description: 'Acesse o painel administrativo para gerenciar o sistema.',
        icon: Settings,
        color: 'from-gray-50 to-slate-50 border-gray-200',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-800',
        descColor: 'text-gray-700',
        buttonColor: 'bg-gray-600 hover:bg-gray-700',
      }
    }
  }

  const cardContent = getCardContent()
  const Icon = cardContent.icon

  return (
    <Card className={`bg-gradient-to-r ${cardContent.color}`}>
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${cardContent.textColor}`}
        >
          <Icon className={`h-5 w-5 ${cardContent.iconColor}`} />
          {cardContent.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className={`text-sm ${cardContent.descColor}`}>
            {cardContent.description}
          </p>
          <div className="flex items-center gap-2">
            <Settings className={`h-4 w-4 ${cardContent.iconColor}`} />
            <span className={`text-sm ${cardContent.descColor} font-medium`}>
              Gerenciar sistema
            </span>
          </div>
          <Button
            onClick={handleGoToAdmin}
            className={`w-full ${cardContent.buttonColor} text-white`}
          >
            Ir para Painel Admin
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
