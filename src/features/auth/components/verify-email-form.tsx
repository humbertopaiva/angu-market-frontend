import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react'
import type { ResendVerificationInput, VerifyEmailInput } from '@/types/graphql'
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

const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Token é obrigatório')
    .min(10, 'Token deve ter pelo menos 10 caracteres'),
})

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

interface VerifyEmailFormProps {
  onVerify: (data: VerifyEmailInput) => Promise<void>
  onResendEmail: (data: ResendVerificationInput) => Promise<void>
  onBackToLogin: () => void
  isLoading: boolean
  email?: string
  token?: string
}

export function VerifyEmailForm({
  onVerify,
  onResendEmail,
  onBackToLogin,
  isLoading,
  email,
  token,
}: VerifyEmailFormProps) {
  const [isResending, setIsResending] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: 'onChange',
    defaultValues: {
      token: token || '',
    },
  })

  // Se token foi passado via URL, preencher automaticamente
  React.useEffect(() => {
    if (token) {
      setValue('token', token)
    }
  }, [token, setValue])

  const handleFormSubmit = async (data: VerifyEmailFormData) => {
    await onVerify(data)
  }

  const handleResendEmail = async () => {
    if (!email) return

    try {
      setIsResending(true)
      await onResendEmail({ email })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Verificar email
        </CardTitle>
        <CardDescription className="text-gray-600">
          {email ? (
            <>
              Enviamos um código de verificação para <br />
              <span className="font-medium text-gray-900">{email}</span>
            </>
          ) : (
            'Digite o código de verificação que você recebeu por email'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="token"
              className="text-sm font-medium text-gray-700"
            >
              Código de verificação
            </Label>
            <Input
              id="token"
              type="text"
              placeholder="Digite o código recebido por email"
              className="h-12 text-center text-lg tracking-wider"
              {...register('token')}
              disabled={isLoading}
            />
            {errors.token && (
              <p className="text-sm text-red-600">{errors.token.message}</p>
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
                Verificando...
              </>
            ) : (
              'Verificar email'
            )}
          </Button>
        </form>

        {/* Seção para reenviar email */}
        {email && (
          <div className="border-t pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Não recebeu o email de verificação?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={handleResendEmail}
                disabled={isLoading || isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar email
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Botão para voltar ao login */}
        <div className="border-t pt-6">
          <Button
            type="button"
            variant="ghost"
            className="w-full h-12 text-base"
            onClick={onBackToLogin}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
