import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DefaultValues, FieldValues, Path } from 'react-hook-form'
import type { ZodType } from 'zod'

interface FormViewModelOptions<TFormValues extends FieldValues> {
  schema: ZodType<any, any>
  defaultValues: TFormValues
  onSubmitHandler: (data: TFormValues) => Promise<void>
}

export function useFormViewModel<TFormValues extends FieldValues>(
  options: FormViewModelOptions<TFormValues>,
) {
  const { schema, defaultValues, onSubmitHandler } = options
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Configurar o hook form com o schema e valores padrão
  const formMethods = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<TFormValues>,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
  } = formMethods

  // Métodos para gerenciar os campos de forma centralizada
  const updateField = (field: Path<TFormValues>, value: any) => {
    setValue(field, value, { shouldValidate: true })
  }

  const clearField = (field: Path<TFormValues>) => {
    setValue(field, '' as any, { shouldValidate: true })
  }

  const getFieldValue = (field: Path<TFormValues>) => {
    return watch(field)
  }

  // Função para lidar com erros de API
  const handleApiError = (error: any, defaultField?: Path<TFormValues>) => {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0]

      // Se o erro contém um campo específico
      if (
        graphQLError.extensions?.field &&
        typeof graphQLError.extensions.field === 'string'
      ) {
        const field = graphQLError.extensions.field as Path<TFormValues>
        setError(field, {
          type: 'manual',
          message: graphQLError.message,
        })
      }
      // Se o erro é geral mas temos um campo padrão
      else if (defaultField) {
        setError(defaultField, {
          type: 'manual',
          message: graphQLError.message,
        })
      }
      // Erro geral sem campo específico
      else {
        setSubmitError(graphQLError.message)
      }
    } else {
      // Erro genérico
      setSubmitError(error.message || 'Ocorreu um erro. Tente novamente.')
    }
  }

  // Função genérica para lidar com o envio do formulário
  const onSubmit = async (data: TFormValues) => {
    setIsLoading(true)
    setSubmitError(null)

    try {
      await onSubmitHandler(data)
    } catch (error: any) {
      console.error('Form submission error:', error)
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // Métodos do react-hook-form
    register,
    handleSubmit,
    errors,
    setError,
    formMethods,
    reset,
    setValue, // Adicionar setValue
    watch, // Adicionar watch

    // Estado do formulário
    isLoading,
    submitError,

    // Métodos para manipular os campos
    updateField,
    clearField,
    getFieldValue,

    // Método de submissão
    onSubmit,
  }
}
