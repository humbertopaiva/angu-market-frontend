import { useNavigate } from '@tanstack/react-router'
import { toast } from 'react-toastify'
import { authService } from '../services/auth.service'
import { signupSchema } from '../schemas/auth.schema'
import { useAuth } from '../context/auth.context'
import type { SignupFormData } from '../schemas/auth.schema'
import { useFormViewModel } from '@/core/hooks/useFormViewModel'

export function useSignupViewModel() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const defaultValues: SignupFormData = {
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  }

  const onSubmitHandler = async (data: SignupFormData) => {
    try {
      const result = await authService.signup(
        data.name,
        data.email,
        data.password,
        data.passwordConfirmation,
      )
      authLogin(result.token, result.user)
      toast.success('Cadastro realizado com sucesso!')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Erro ao realizar cadastro.')
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
    reset,
    setValue,
    watch,
  } = useFormViewModel({
    schema: signupSchema,
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
    reset,
    setValue,
    watch,
  }
}
