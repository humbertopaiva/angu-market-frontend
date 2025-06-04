// src/features/admin/components/user-form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Save, User, X } from 'lucide-react'
import type {
  CreateUserInput,
  UpdateUserInput,
} from '../services/users-service'
import type { Place, User as UserType } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const userFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .optional(),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .optional(),
  phone: z.string().optional(),
  placeId: z.number().optional(),
  role: z.enum([
    'PLACE_ADMIN',
    'COMPANY_ADMIN',
    'COMPANY_STAFF',
    'PUBLIC_USER',
  ]),
  isActive: z.boolean().optional(),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: UserType
  places: Array<Place>
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>
  isLoading: boolean
}

const roleOptions = [
  { value: 'PLACE_ADMIN', label: 'Administrador do Place' },
  { value: 'COMPANY_ADMIN', label: 'Administrador de Empresa' },
  { value: 'COMPANY_STAFF', label: 'Funcionário' },
  { value: 'PUBLIC_USER', label: 'Usuário Público' },
] as const

const getRoleIdByName = (roleName: string): number => {
  const roleMap: Record<string, number> = {
    PLACE_ADMIN: 3,
    COMPANY_ADMIN: 4,
    COMPANY_STAFF: 5,
    PUBLIC_USER: 6,
  }
  return roleMap[roleName] || 6
}

export function UserForm({
  user,
  places,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: UserFormProps) {
  const isEditing = !!user
  const [showPassword, setShowPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      placeId: undefined,
      role: 'PUBLIC_USER',
      isActive: true,
    },
  })

  React.useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        email: undefined, // Não mostrar email na edição
        password: undefined, // Não mostrar senha na edição
        phone: user.phone || '',
        placeId: user.placeId || undefined,
        role: (user.userRoles?.[0]?.role?.name as any) || 'PUBLIC_USER',
        isActive: user.isActive,
      })
    } else if (isOpen && !user) {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        placeId: undefined,
        role: 'PUBLIC_USER',
        isActive: true,
      })
    }
  }, [isOpen, user, reset])

  const selectedRole = watch('role')
  const selectedPlaceId = watch('placeId')

  const handleFormSubmit = async (data: UserFormData) => {
    const roleId = getRoleIdByName(data.role)

    if (isEditing) {
      const updateData: UpdateUserInput = {
        id: Number(user.id),
        name: data.name,
        phone: data.phone || undefined,
        placeId: data.placeId || undefined,
        roleIds: [roleId],
        isActive: data.isActive,
      }
      await onSubmit(updateData)
    } else {
      if (!data.email || !data.password) {
        return // Não deveria chegar aqui devido à validação, mas é uma proteção
      }

      const submitData: CreateUserInput = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        placeId: data.placeId || undefined,
        roleIds: [roleId],
        isActive: data.isActive,
      }
      await onSubmit(submitData)
    }

    onClose()
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações do usuário abaixo.'
              : 'Preencha as informações para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome *
            </Label>
            <Input
              id="name"
              placeholder="Nome completo"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  {...register('email', { required: !isEditing })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha do usuário"
                    {...register('password', { required: !isEditing })}
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
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefone
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Função *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {(selectedRole === 'PLACE_ADMIN' ||
            selectedRole === 'COMPANY_ADMIN' ||
            selectedRole === 'COMPANY_STAFF') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Place {selectedRole === 'PLACE_ADMIN' ? '*' : ''}
              </Label>
              <Select
                value={selectedPlaceId?.toString() || 'no-place'}
                onValueChange={(value) =>
                  setValue(
                    'placeId',
                    value === 'no-place' ? undefined : Number(value),
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um place" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-place">Nenhum place</SelectItem>
                  {places.map((place) => (
                    <SelectItem key={place.id} value={place.id}>
                      {place.name} - {place.city}, {place.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="isActive" className="text-sm font-medium">
              Usuário ativo
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Atualizar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
