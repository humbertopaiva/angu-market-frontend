import { useNavigate } from '@tanstack/react-router'
import { toast } from 'react-toastify'

import { authService } from '../services/auth.service'
import { loginSchema } from '../schemas/auth.schema'
import { useAuth } from '../context/auth.context'
import type { LoginFormData } from '../schemas/auth.schema'
import { useFormViewModel } from '@/core/hooks/useFormViewModel'

export function useLoginViewModel() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const defaultValues: LoginFormData = {
    email: '',
    password: '',
  }

  const onSubmitHandler = async (data: LoginFormData) => {
    try {
      const result = await authService.login(data.email, data.password)
      authLogin(result.token, result.user)
      toast.success('Login realizado com sucesso!')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
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
    schema: loginSchema,
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
    setValue,
    watch,
  }
}
