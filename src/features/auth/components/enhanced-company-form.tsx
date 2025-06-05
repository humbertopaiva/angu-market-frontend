// src/features/admin/components/enhanced-company-form.tsx
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react'

import type {
  Company,
  CreateCompanyInput,
  Place,
  UpdateCompanyInput,
  User as UserType,
} from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const companyUserSchema = z.object({
  existingUserId: z.number().optional(),
  name: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['COMPANY_ADMIN', 'COMPANY_STAFF']).optional(),
  isActive: z.boolean().optional(),
})

const enhancedCompanySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens',
    ),
  description: z.string().min(1, 'Descrição é obrigatória'),
  placeId: z.number().min(1, 'Place é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z
    .string()
    .url('Website deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  openingHours: z.string().optional(),
  logo: z
    .string()
    .url('Logo deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
  banner: z
    .string()
    .url('Banner deve ser uma URL válida')
    .optional()
    .or(z.literal('')),
  cnpj: z.string().optional(),
  isActive: z.boolean().optional(),
  users: z.array(companyUserSchema).optional(),
})

type EnhancedCompanyFormData = z.infer<typeof enhancedCompanySchema>

interface EnhancedCompanyFormProps {
  company?: Company
  places: Array<Place>
  availableUsers: Array<UserType>
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCompanyInput | UpdateCompanyInput) => Promise<void>
  isLoading: boolean
}

export function EnhancedCompanyForm({
  company,
  places,
  availableUsers,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: EnhancedCompanyFormProps) {
  const isEditing = !!company
  const [showPasswords, setShowPasswords] = React.useState<
    Record<number, boolean>
  >({})

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<EnhancedCompanyFormData>({
    resolver: zodResolver(enhancedCompanySchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
      users: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'users',
  })

  React.useEffect(() => {
    if (isOpen && company) {
      reset({
        name: company.name,
        slug: company.slug,
        description: company.description,
        placeId: Number(company.placeId),
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        address: company.address || '',
        latitude: company.latitude || undefined,
        longitude: company.longitude || undefined,
        openingHours: company.openingHours || '',
        logo: company.logo || '',
        banner: company.banner || '',
        cnpj: company.cnpj || '',
        isActive: company.isActive,
        users: [],
      })
    } else if (isOpen && !company) {
      reset({
        name: '',
        slug: '',
        description: '',
        placeId: undefined as any,
        phone: '',
        email: '',
        website: '',
        address: '',
        latitude: undefined,
        longitude: undefined,
        openingHours: '',
        logo: '',
        banner: '',
        cnpj: '',
        isActive: true,
        users: [],
      })
    }
  }, [isOpen, company, reset])

  const selectedPlaceId = watch('placeId')

  const togglePasswordVisibility = (index: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const addExistingUser = () => {
    append({
      existingUserId: undefined,
      role: 'COMPANY_STAFF',
      isActive: true,
    })
  }

  const addNewUser = () => {
    append({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'COMPANY_STAFF',
      isActive: true,
    })
  }

  const handleFormSubmit = async (data: EnhancedCompanyFormData) => {
    try {
      const submitData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        placeId: data.placeId,
        isActive: data.isActive ?? true,
      }

      // Processar campos opcionais
      if (data.phone && data.phone.trim()) {
        submitData.phone = data.phone.trim()
      }
      if (data.email && data.email.trim()) {
        submitData.email = data.email.trim()
      }
      if (data.website && data.website.trim()) {
        submitData.website = data.website.trim()
      }
      if (data.address && data.address.trim()) {
        submitData.address = data.address.trim()
      }
      if (
        data.latitude !== undefined &&
        !isNaN(data.latitude) &&
        data.latitude !== 0
      ) {
        submitData.latitude = Number(data.latitude)
      }
      if (
        data.longitude !== undefined &&
        !isNaN(data.longitude) &&
        data.longitude !== 0
      ) {
        submitData.longitude = Number(data.longitude)
      }
      if (data.openingHours && data.openingHours.trim()) {
        submitData.openingHours = data.openingHours.trim()
      }
      if (data.logo && data.logo.trim()) {
        submitData.logo = data.logo.trim()
      }
      if (data.banner && data.banner.trim()) {
        submitData.banner = data.banner.trim()
      }
      if (data.cnpj && data.cnpj.trim()) {
        submitData.cnpj = data.cnpj.trim()
      }

      // Processar usuários
      if (data.users && data.users.length > 0) {
        submitData.users = data.users
          .filter((user) => {
            // Filtrar usuários válidos
            return (
              user.existingUserId || (user.name && user.email && user.password)
            )
          })
          .map((user) => ({
            ...user,
            name: user.name?.trim(),
            email: user.email?.trim(),
            phone: user.phone?.trim(),
          }))
      }

      console.log('Enhanced form submit data:', submitData)

      if (isEditing) {
        await onSubmit({
          ...submitData,
          id: Number(company.id),
        } as UpdateCompanyInput)
      } else {
        await onSubmit(submitData as CreateCompanyInput)
      }

      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {isEditing ? 'Editar Empresa' : 'Criar Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações da empresa abaixo.'
              : 'Preencha as informações para criar uma nova empresa e seus usuários.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6">
              {/* Dados básicos da empresa - mesmo conteúdo do formulário anterior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Nome da empresa"
                    {...register('name')}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium">
                    Slug *
                  </Label>
                  <Input
                    id="slug"
                    placeholder="slug-da-empresa"
                    {...register('slug')}
                    disabled={isLoading}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descrição da empresa"
                  {...register('description')}
                  disabled={isLoading}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Place *</Label>
                <Select
                  value={selectedPlaceId ? selectedPlaceId.toString() : ''}
                  onValueChange={(value) => setValue('placeId', Number(value))}
                  disabled={isLoading || places.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        places.length === 0
                          ? 'Nenhum place disponível'
                          : 'Selecione um place'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {places.length === 0 ? (
                      <SelectItem value="" disabled>
                        Nenhum place disponível
                      </SelectItem>
                    ) : (
                      places.map((place) => (
                        <SelectItem key={place.id} value={place.id}>
                          {place.name} - {place.city}, {place.state}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.placeId && (
                  <p className="text-sm text-red-600">
                    {errors.placeId.message}
                  </p>
                )}
              </div>

              {/* Outros campos da empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://empresa.com"
                    {...register('website')}
                    disabled={isLoading}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-600">
                      {errors.website.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-sm font-medium">
                    CNPJ
                  </Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    {...register('cnpj')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Endereço
                </Label>
                <Input
                  id="address"
                  placeholder="Endereço completo"
                  {...register('address')}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openingHours" className="text-sm font-medium">
                  Horário de Funcionamento
                </Label>
                <Input
                  id="openingHours"
                  placeholder="Seg-Sex: 9h-18h"
                  {...register('openingHours')}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Empresa ativa
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Usuários da Empresa</h3>
                  <p className="text-sm text-gray-600">
                    Adicione usuários existentes ou crie novos usuários para
                    esta empresa
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExistingUser}
                    disabled={isLoading}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Usuário Existente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewUser}
                    disabled={isLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                </div>
              </div>

              {fields.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum usuário adicionado
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      Adicione usuários existentes ou crie novos para gerenciar
                      esta empresa.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Usuário {index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Seletor: Usuário existente ou novo */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Tipo de Usuário
                        </Label>
                        <Select
                          value={
                            watch(`users.${index}.existingUserId`)
                              ? 'existing'
                              : 'new'
                          }
                          onValueChange={(value) => {
                            if (value === 'existing') {
                              setValue(
                                `users.${index}.existingUserId`,
                                undefined,
                              )
                              setValue(`users.${index}.name`, '')
                              setValue(`users.${index}.email`, '')
                              setValue(`users.${index}.password`, '')
                            } else {
                              setValue(
                                `users.${index}.existingUserId`,
                                undefined,
                              )
                            }
                          }}
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="existing">
                              Usuário Existente
                            </SelectItem>
                            <SelectItem value="new">Novo Usuário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campos para usuário existente */}
                      {!watch(`users.${index}.name`) &&
                        !watch(`users.${index}.email`) && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Selecionar Usuário Existente
                            </Label>
                            <Select
                              value={
                                watch(
                                  `users.${index}.existingUserId`,
                                )?.toString() || ''
                              }
                              onValueChange={(value) => {
                                setValue(
                                  `users.${index}.existingUserId`,
                                  Number(value),
                                )
                              }}
                              disabled={isLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um usuário" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers
                                  .filter(
                                    (user) =>
                                      Number(user.placeId) === selectedPlaceId,
                                  )
                                  .map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {user.name} - {user.email}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                      {/* Campos para novo usuário */}
                      {!watch(`users.${index}.existingUserId`) && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Nome *
                              </Label>
                              <Input
                                placeholder="Nome completo"
                                {...register(`users.${index}.name`)}
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Email *
                              </Label>
                              <Input
                                type="email"
                                placeholder="usuario@empresa.com"
                                {...register(`users.${index}.email`)}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Senha *
                              </Label>
                              <div className="relative">
                                <Input
                                  type={
                                    showPasswords[index] ? 'text' : 'password'
                                  }
                                  placeholder="Senha do usuário"
                                  {...register(`users.${index}.password`)}
                                  disabled={isLoading}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                                  onClick={() =>
                                    togglePasswordVisibility(index)
                                  }
                                  disabled={isLoading}
                                >
                                  {showPasswords[index] ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Telefone
                              </Label>
                              <Input
                                placeholder="(11) 99999-9999"
                                {...register(`users.${index}.phone`)}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Campos comuns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Função</Label>
                          <Select
                            value={
                              watch(`users.${index}.role`) || 'COMPANY_STAFF'
                            }
                            onValueChange={(value) => {
                              setValue(`users.${index}.role`, value as any)
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COMPANY_ADMIN">
                                Administrador da Empresa
                              </SelectItem>
                              <SelectItem value="COMPANY_STAFF">
                                Funcionário
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            {...register(`users.${index}.isActive`)}
                            disabled={isLoading}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            defaultChecked={true}
                          />
                          <Label className="text-sm font-medium">
                            Usuário ativo
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

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
            <Button
              type="submit"
              disabled={isLoading || !isValid || places.length === 0}
            >
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
