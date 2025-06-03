import { useState } from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { authService } from '../services/auth.service'
import { useFormViewModel } from '@/core/hooks/useFormViewModel'

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function useResetPasswordViewModel(token: string) {
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const defaultValues: ResetPasswordFormData = {
    newPassword: '',
    confirmPassword: '',
  }

  const onSubmitHandler = async (data: ResetPasswordFormData) => {
    try {
      const result = await authService.resetPassword(token, data.newPassword)
      setSuccess(result.success)
      setMessage(result.message)

      if (result.success) {
        toast.success('Senha atualizada com sucesso!')
      } else {
        toast.warning(result.message)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setSuccess(false)
      setMessage(
        'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
      )
      throw error
    }
  }

  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    submitError,
    onSubmit,
    setValue,
    watch,
  } = useFormViewModel({
    schema: resetPasswordSchema,
    defaultValues,
    onSubmitHandler,
  })

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    submitError,
    message,
    success,
    setValue,
    watch,
  }
}
