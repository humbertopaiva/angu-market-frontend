// src/features/auth/components/company-login-form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { CompanyLoginInput } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const companyLoginSchema = z.object({
  companySlug: z
    .string()
    .min(1, 'Slug da empresa é obrigatório')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens',
    ),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type CompanyLoginFormData = z.infer<typeof companyLoginSchema>

interface CompanyLoginFormProps {
  onSubmit: (data: CompanyLoginInput) => Promise<void>
  isLoading: boolean
  onBackToMainLogin: () => void
}

export function CompanyLoginForm({
  onSubmit,
  isLoading,
  onBackToMainLogin,
}: CompanyLoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CompanyLoginFormData>({
    resolver: zodResolver(companyLoginSchema),
    mode: 'onChange',
  })

  const handleFormSubmit = async (data: CompanyLoginFormData) => {
    await onSubmit(data)
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">
          Acesso Empresarial
        </CardTitle>
        <CardDescription className="text-gray-600">
          Entre com suas credenciais da empresa
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="companySlug"
              className="text-sm font-medium text-gray-700"
            >
              Slug da Empresa
            </Label>
            <Input
              id="companySlug"
              type="text"
              placeholder="minha-empresa"
              className="h-12"
              {...register('companySlug')}
              disabled={isLoading}
            />
            {errors.companySlug && (
              <p className="text-sm text-red-600">
                {errors.companySlug.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Digite o identificador único da sua empresa
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-12"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                className="h-12 pr-10"
                {...register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar na Empresa'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={onBackToMainLogin}
            disabled={isLoading}
          >
            Voltar ao Login Principal
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
