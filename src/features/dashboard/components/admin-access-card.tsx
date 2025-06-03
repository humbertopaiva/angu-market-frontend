import React from 'react'
import { ArrowRight, Settings, Shield } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { isSuperAdmin } from '@/utils/role-helpers'

export function AdminAccessCard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  if (!user || !isSuperAdmin(user)) {
    return null
  }

  const handleGoToAdmin = () => {
    navigate({ to: '/admin' })
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="h-5 w-5" />
          Acesso Administrativo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-orange-700">
            Como Super Administrador, você tem acesso ao painel administrativo
            para gerenciar places, usuários e configurações do sistema.
          </p>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700 font-medium">
              Gerenciar sistema
            </span>
          </div>
          <Button
            onClick={handleGoToAdmin}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Ir para Painel Admin
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
