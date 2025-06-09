// src/features/admin/components/company-form.tsx - CORRIGIDO
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building, Loader2, Save, X } from 'lucide-react'
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from '../services/companies-service'

import type {
  Category,
  Company,
  Place,
  Segment,
  Subcategory,
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

const companySchema = z.object({
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

  // HIERARQUIA DE SEGMENTAÇÃO - TODOS OBRIGATÓRIOS
  segmentId: z.number().min(1, 'Segmento é obrigatório'),
  categoryId: z.number().min(1, 'Categoria é obrigatória'),
  subcategoryId: z.number().min(1, 'Subcategoria é obrigatória'),

  // CAMPOS OPCIONAIS
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
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  places: Array<Place>
  segments: Array<Segment>
  categories: Array<Category>
  subcategories: Array<Subcategory>
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCompanyInput | UpdateCompanyInput) => Promise<void>
  isLoading: boolean
}

export function CompanyForm({
  company,
  places,
  segments,
  categories,
  subcategories,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CompanyFormProps) {
  const isEditing = !!company

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
    },
  })

  React.useEffect(() => {
    if (isOpen && company) {
      console.log('Company form - editing company:', {
        id: company.id,
        name: company.name,
        segmentId: company.segmentId,
        categoryId: company.categoryId,
        subcategoryId: company.subcategoryId,
        segment: company.segment?.name,
        category: company.category?.name,
        subcategory: company.subcategory?.name,
      })

      // CORREÇÃO: Buscar segmentId da empresa através da categoria ou segmento direto
      let segmentId: number | undefined = undefined

      if (company.segmentId) {
        segmentId = Number(company.segmentId)
      } else if (company.category?.segments?.[0]) {
        segmentId = Number(company.category.segments[0].id)
      } else if (company.subcategory?.category.segments?.[0]) {
        segmentId = Number(company.subcategory.category.segments[0].id)
      }

      reset({
        name: company.name,
        slug: company.slug,
        description: company.description,
        placeId: Number(company.placeId),
        // CORREÇÃO: Carregar valores corretamente da empresa
        segmentId: segmentId,
        categoryId: company.categoryId ? Number(company.categoryId) : undefined,
        subcategoryId: company.subcategoryId
          ? Number(company.subcategoryId)
          : undefined,
        // Campos opcionais
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
      })

      console.log('Company form - reset with values:', {
        segmentId,
        categoryId: company.categoryId,
        subcategoryId: company.subcategoryId,
      })
    } else if (isOpen && !company) {
      reset({
        name: '',
        slug: '',
        description: '',
        placeId: undefined as any,
        segmentId: undefined as any,
        categoryId: undefined as any,
        subcategoryId: undefined as any,
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
      })
    }
  }, [isOpen, company, reset])

  const selectedPlaceId = watch('placeId')
  const selectedSegmentId = watch('segmentId')
  const selectedCategoryId = watch('categoryId')

  // Filtrar segmentos por place
  const availableSegments = React.useMemo(() => {
    if (!selectedPlaceId) return []
    return segments.filter(
      (segment) => Number(segment.placeId) === selectedPlaceId,
    )
  }, [segments, selectedPlaceId])

  // Filtrar categorias por place e segmento
  const availableCategories = React.useMemo(() => {
    if (!selectedPlaceId || !selectedSegmentId) return []

    return categories.filter((category) => {
      // Deve ser do mesmo place
      if (Number(category.placeId) !== selectedPlaceId) return false

      // Deve pertencer ao segmento selecionado
      return category.segments?.some(
        (segment) => Number(segment.id) === selectedSegmentId,
      )
    })
  }, [categories, selectedPlaceId, selectedSegmentId])

  // Filtrar subcategorias por categoria
  const availableSubcategories = React.useMemo(() => {
    if (!selectedCategoryId) return []
    return subcategories.filter(
      (subcategory) => Number(subcategory.categoryId) === selectedCategoryId,
    )
  }, [subcategories, selectedCategoryId])

  // CORREÇÃO: Resetar seleções em cascata APENAS quando não estiver editando
  React.useEffect(() => {
    if (selectedPlaceId && !isEditing) {
      setValue('segmentId', undefined as any)
      setValue('categoryId', undefined as any)
      setValue('subcategoryId', undefined as any)
    }
  }, [selectedPlaceId, isEditing, setValue])

  React.useEffect(() => {
    if (selectedSegmentId && !isEditing) {
      setValue('categoryId', undefined as any)
      setValue('subcategoryId', undefined as any)
    }
  }, [selectedSegmentId, isEditing, setValue])

  React.useEffect(() => {
    if (selectedCategoryId && !isEditing) {
      setValue('subcategoryId', undefined as any)
    }
  }, [selectedCategoryId, isEditing, setValue])

  const handleFormSubmit = async (data: CompanyFormData) => {
    try {
      console.log('Company form submit - data:', data)

      // Processar os dados para enviar
      const submitData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        placeId: data.placeId,
        // HIERARQUIA OBRIGATÓRIA
        segmentId: data.segmentId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        isActive: data.isActive ?? true,
      }

      // Adicionar campos opcionais apenas se tiverem valor válido
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

      // Só incluir latitude/longitude se forem valores válidos (não zero)
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

      console.log(
        'Company form submit data (with required hierarchy):',
        submitData,
      )

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {isEditing ? 'Editar Empresa' : 'Criar Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações da empresa abaixo.'
              : 'Preencha as informações para criar uma nova empresa. Todos os campos de segmentação são obrigatórios.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Básicas */}
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
                <p className="text-sm text-red-600">{errors.name.message}</p>
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
                <p className="text-sm text-red-600">{errors.slug.message}</p>
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
              value={selectedPlaceId ? selectedPlaceId.toString() : 'no-place'}
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
                  <SelectItem value="no-places" disabled>
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
              <p className="text-sm text-red-600">{errors.placeId.message}</p>
            )}
          </div>

          {/* SEÇÃO DE SEGMENTAÇÃO OBRIGATÓRIA */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Categorização *
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Todos os campos abaixo são obrigatórios. A hierarquia deve ser:
              Segmento → Categoria → Subcategoria
            </p>

            {/* MOSTRAR SEGMENTAÇÃO ATUAL EM EDIÇÃO */}
            {isEditing && (
              <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Segmentação Atual:
                </h4>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <span className="font-medium">
                    {company.segment?.name || 'Sem segmento'}
                  </span>
                  <span>→</span>
                  <span className="font-medium">
                    {company.category?.name || 'Sem categoria'}
                  </span>
                  <span>→</span>
                  <span className="font-medium">
                    {company.subcategory?.name || 'Sem subcategoria'}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SEGMENTO OBRIGATÓRIO */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Segmento *</Label>
                <Select
                  value={
                    selectedSegmentId
                      ? selectedSegmentId.toString()
                      : 'no-segment'
                  }
                  onValueChange={(value) =>
                    setValue(
                      'segmentId',
                      value === 'no-segment'
                        ? (undefined as any)
                        : Number(value),
                    )
                  }
                  disabled={
                    isLoading ||
                    !selectedPlaceId ||
                    availableSegments.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedPlaceId
                          ? 'Selecione um place primeiro'
                          : availableSegments.length === 0
                            ? 'Nenhum segmento disponível'
                            : 'Selecione um segmento'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSegments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: segment.color || '#6B7280',
                            }}
                          />
                          {segment.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.segmentId && (
                  <p className="text-sm text-red-600">
                    {errors.segmentId.message}
                  </p>
                )}
              </div>

              {/* CATEGORIA OBRIGATÓRIA */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoria *</Label>
                <Select
                  value={
                    selectedCategoryId
                      ? selectedCategoryId.toString()
                      : 'no-category'
                  }
                  onValueChange={(value) =>
                    setValue(
                      'categoryId',
                      value === 'no-category'
                        ? (undefined as any)
                        : Number(value),
                    )
                  }
                  disabled={
                    isLoading ||
                    !selectedSegmentId ||
                    availableCategories.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedSegmentId
                          ? 'Selecione um segmento primeiro'
                          : availableCategories.length === 0
                            ? 'Nenhuma categoria disponível'
                            : 'Selecione uma categoria'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: category.color || '#22C55E',
                            }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-600">
                    {errors.categoryId.message}
                  </p>
                )}
                {selectedSegmentId && availableCategories.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Nenhuma categoria encontrada para este segmento.
                  </p>
                )}
              </div>

              {/* SUBCATEGORIA OBRIGATÓRIA */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subcategoria *</Label>
                <Select
                  value={
                    watch('subcategoryId')
                      ? watch('subcategoryId').toString()
                      : 'no-subcategory'
                  }
                  onValueChange={(value) =>
                    setValue(
                      'subcategoryId',
                      value === 'no-subcategory'
                        ? (undefined as any)
                        : Number(value),
                    )
                  }
                  disabled={
                    isLoading ||
                    !selectedCategoryId ||
                    availableSubcategories.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedCategoryId
                          ? 'Selecione uma categoria primeiro'
                          : availableSubcategories.length === 0
                            ? 'Nenhuma subcategoria disponível'
                            : 'Selecione uma subcategoria'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategoryId && (
                  <p className="text-sm text-red-600">
                    {errors.subcategoryId.message}
                  </p>
                )}
                {selectedCategoryId && availableSubcategories.length === 0 && (
                  <p className="text-xs text-amber-600">
                    Nenhuma subcategoria encontrada para esta categoria.
                  </p>
                )}
              </div>
            </div>

            {/* PREVIEW DA HIERARQUIA SELECIONADA */}
            {selectedSegmentId &&
              selectedCategoryId &&
              watch('subcategoryId') && (
                <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    Hierarquia Selecionada:
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <span className="font-medium">
                      {
                        availableSegments.find(
                          (s) => Number(s.id) === selectedSegmentId,
                        )?.name
                      }
                    </span>
                    <span>→</span>
                    <span className="font-medium">
                      {
                        availableCategories.find(
                          (c) => Number(c.id) === selectedCategoryId,
                        )?.name
                      }
                    </span>
                    <span>→</span>
                    <span className="font-medium">
                      {
                        availableSubcategories.find(
                          (s) => Number(s.id) === watch('subcategoryId'),
                        )?.name
                      }
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* CAMPOS OPCIONAIS DA EMPRESA */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informações Adicionais (Opcional)
            </h3>

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
                  <p className="text-sm text-red-600">{errors.email.message}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm font-medium">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="-23.5505"
                  {...register('latitude')}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm font-medium">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-46.6333"
                  {...register('longitude')}
                  disabled={isLoading}
                />
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-sm font-medium">
                  Logo (URL)
                </Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  {...register('logo')}
                  disabled={isLoading}
                />
                {errors.logo && (
                  <p className="text-sm text-red-600">{errors.logo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner" className="text-sm font-medium">
                  Banner (URL)
                </Label>
                <Input
                  id="banner"
                  type="url"
                  placeholder="https://exemplo.com/banner.png"
                  {...register('banner')}
                  disabled={isLoading}
                />
                {errors.banner && (
                  <p className="text-sm text-red-600">
                    {errors.banner.message}
                  </p>
                )}
              </div>
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
            <Button
              type="submit"
              disabled={
                isLoading ||
                !isValid ||
                places.length === 0 ||
                !selectedSegmentId ||
                !selectedCategoryId ||
                !watch('subcategoryId')
              }
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
