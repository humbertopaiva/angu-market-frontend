import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, MapPin, Save, X } from 'lucide-react'
import type {
  CreatePlaceInput,
  UpdatePlaceInput,
} from '../services/places-service'
import type { Place } from '@/types/graphql'
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

const placeSchema = z.object({
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
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  neighborhood: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
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
  isActive: z.boolean().optional(),
})

type PlaceFormData = z.infer<typeof placeSchema>

interface PlaceFormProps {
  place?: Place
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePlaceInput | UpdatePlaceInput) => Promise<void>
  isLoading: boolean
}

export function PlaceForm({
  place,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PlaceFormProps) {
  const isEditing = !!place

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
    },
  })

  React.useEffect(() => {
    if (isOpen && place) {
      reset({
        name: place.name,
        slug: place.slug,
        description: place.description,
        city: place.city,
        state: place.state,
        neighborhood: place.neighborhood || '',
        postalCode: place.postalCode || '',
        latitude: place.latitude || undefined,
        longitude: place.longitude || undefined,
        logo: place.logo || '',
        banner: place.banner || '',
        isActive: place.isActive,
      })
    } else if (isOpen && !place) {
      reset({
        name: '',
        slug: '',
        description: '',
        city: '',
        state: '',
        neighborhood: '',
        postalCode: '',
        latitude: undefined,
        longitude: undefined,
        logo: '',
        banner: '',
        isActive: true,
      })
    }
  }, [isOpen, place, reset])

  const handleFormSubmit = async (data: PlaceFormData) => {
    try {
      // Processar os dados para enviar apenas campos válidos
      const submitData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        isActive: data.isActive ?? true,
      }

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.neighborhood && data.neighborhood.trim()) {
        submitData.neighborhood = data.neighborhood.trim()
      }

      if (data.postalCode && data.postalCode.trim()) {
        submitData.postalCode = data.postalCode.trim()
      }

      if (data.latitude !== undefined && !isNaN(data.latitude)) {
        submitData.latitude = Number(data.latitude)
      }

      if (data.longitude !== undefined && !isNaN(data.longitude)) {
        submitData.longitude = Number(data.longitude)
      }

      if (data.logo && data.logo.trim()) {
        submitData.logo = data.logo.trim()
      }

      if (data.banner && data.banner.trim()) {
        submitData.banner = data.banner.trim()
      }

      console.log('Form submit data:', submitData)

      if (isEditing) {
        await onSubmit({
          ...submitData,
          id: Number(place.id),
        } as UpdatePlaceInput)
      } else {
        await onSubmit(submitData as CreatePlaceInput)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEditing ? 'Editar Place' : 'Criar Novo Place'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações do place abaixo.'
              : 'Preencha as informações para criar um novo place.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome *
              </Label>
              <Input
                id="name"
                placeholder="Nome do place"
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
                placeholder="slug-do-place"
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
              placeholder="Descrição do place"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">
                Cidade *
              </Label>
              <Input
                id="city"
                placeholder="Cidade"
                {...register('city')}
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                Estado *
              </Label>
              <Input
                id="state"
                placeholder="Estado"
                {...register('state')}
                disabled={isLoading}
              />
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="text-sm font-medium">
                Bairro
              </Label>
              <Input
                id="neighborhood"
                placeholder="Bairro"
                {...register('neighborhood')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium">
                CEP
              </Label>
              <Input
                id="postalCode"
                placeholder="00000-000"
                {...register('postalCode')}
                disabled={isLoading}
              />
            </div>
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
                <p className="text-sm text-red-600">{errors.banner.message}</p>
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
              Place ativo
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
