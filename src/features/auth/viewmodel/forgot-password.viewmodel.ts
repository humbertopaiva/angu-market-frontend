import { useState } from 'react'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { authService } from '../services/auth.service'
import { useFormViewModel } from '@/core/hooks/useFormViewModel'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function useForgotPasswordViewModel() {
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const defaultValues: ForgotPasswordFormData = {
    email: '',
  }

  const onSubmitHandler = async (data: ForgotPasswordFormData) => {
    try {
      const result = await authService.requestPasswordReset(data.email)
      setSuccess(result.success)
      setMessage(result.message)

      if (result.success) {
        toast.success('Instruções de recuperação enviadas para seu email')
      } else {
        toast.warning(result.message)
      }
    } catch (error) {
      console.error('Error requesting password reset:', error)
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
    schema: forgotPasswordSchema,
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
