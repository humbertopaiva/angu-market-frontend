import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { useCompanyAuthViewModel } from '../viewmodel/company-auth-viewmodel'
import { useAuthStore } from '../stores/auth-store'
import type { CompanyLoginInput } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const companyLoginSchema = z.object({
  companySlug: z
    .string()
    .min(1, 'Slug da empresa é obrigatório')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens',
    ),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type CompanyLoginFormData = z.infer<typeof companyLoginSchema>

export function CompanyLoginView() {
  const companyAuthViewModel = useCompanyAuthViewModel()
  const { isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<CompanyLoginFormData>({
    resolver: zodResolver(companyLoginSchema),
    mode: 'onChange',
    defaultValues: {
      companySlug: '',
      email: '',
      password: '',
    },
  })

  // Tentar extrair slug da URL se disponível
  React.useEffect(() => {
    const urlSlug = companyAuthViewModel.extractSlugFromUrl()
    if (urlSlug) {
      setValue('companySlug', urlSlug)
    }
  }, [setValue])

  const companySlug = watch('companySlug')

  const onSubmit = async (data: CompanyLoginFormData) => {
    const loginData: CompanyLoginInput = {
      companySlug: companyAuthViewModel.formatCompanySlug(data.companySlug),
      email: data.email.trim(),
      password: data.password,
    }

    await companyAuthViewModel.login(loginData)
  }

  const handleBackToMainSite = () => {
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Login Empresarial
          </CardTitle>
          <p className="text-gray-600">Acesse o painel da sua empresa</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companySlug">Slug da Empresa</Label>
              <div className="relative">
                <Input
                  id="companySlug"
                  type="text"
                  placeholder="nome-da-empresa"
                  {...register('companySlug')}
                  disabled={isLoading}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {errors.companySlug && (
                <p className="text-sm text-red-600">
                  {errors.companySlug.message}
                </p>
              )}
              {companySlug && (
                <p className="text-xs text-gray-500">
                  URL: /company/
                  {companyAuthViewModel.formatCompanySlug(companySlug)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  {...register('password')}
                  disabled={isLoading}
                  className="pr-10"
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
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar na Empresa
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleBackToMainSite}
              className="text-sm"
            >
              ← Voltar ao site principal
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Acesso Empresarial:</strong> Este login é exclusivo para
              administradores e funcionários de empresas cadastradas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
