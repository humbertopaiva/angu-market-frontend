import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react'
import type { SignUpInput } from '@/types/graphql'
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

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    passwordConfirmation: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
    securityToken: z.string().min(1, 'Token de segurança é obrigatório'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem',
    path: ['passwordConfirmation'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSubmit: (data: SignUpInput) => Promise<void>
  isLoading: boolean
  onBackToLogin: () => void
}

export function SignUpForm({
  onSubmit,
  isLoading,
  onBackToLogin,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  })

  const handleFormSubmit = async (data: SignUpFormData) => {
    await onSubmit(data)
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">
          Criar conta
        </CardTitle>
        <CardDescription className="text-gray-600">
          Preencha os dados abaixo para criar sua conta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              className="h-12"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
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

          <div className="space-y-2">
            <Label
              htmlFor="passwordConfirmation"
              className="text-sm font-medium text-gray-700"
            >
              Confirmar senha
            </Label>
            <div className="relative">
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                className="h-12 pr-10"
                {...register('passwordConfirmation')}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.passwordConfirmation && (
              <p className="text-sm text-red-600">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="securityToken"
              className="text-sm font-medium text-gray-700"
            >
              Token de segurança
            </Label>
            <Input
              id="securityToken"
              type="text"
              placeholder="Token fornecido pelo administrador"
              className="h-12"
              {...register('securityToken')}
              disabled={isLoading}
            />
            {errors.securityToken && (
              <p className="text-sm text-red-600">
                {errors.securityToken.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Apenas usuários autorizados podem se registrar
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full h-12 text-base"
            onClick={onBackToLogin}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Já tenho uma conta
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
