// src/features/admin/components/segment-form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, Tags, X } from 'lucide-react'
import type {
  CreateSegmentInput,
  UpdateSegmentInput,
} from '../services/segments-service'
import type { Place, Segment } from '@/types/graphql'
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

const segmentSchema = z.object({
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
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido')
    .optional(),
  order: z.coerce
    .number()
    .min(0, 'Ordem deve ser maior ou igual a zero')
    .optional(),
  isActive: z.boolean().optional(),
})

type SegmentFormData = z.infer<typeof segmentSchema>

interface SegmentFormProps {
  segment?: Segment
  places: Array<Place>
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSegmentInput | UpdateSegmentInput) => Promise<void>
  isLoading: boolean
}

const availableColors = [
  { value: '#EF4444', label: 'Vermelho', preview: 'bg-red-500' },
  { value: '#F97316', label: 'Laranja', preview: 'bg-orange-500' },
  { value: '#EAB308', label: 'Amarelo', preview: 'bg-yellow-500' },
  { value: '#22C55E', label: 'Verde', preview: 'bg-green-500' },
  { value: '#06B6D4', label: 'Azul Claro', preview: 'bg-cyan-500' },
  { value: '#3B82F6', label: 'Azul', preview: 'bg-blue-500' },
  { value: '#8B5CF6', label: 'Roxo', preview: 'bg-violet-500' },
  { value: '#EC4899', label: 'Rosa', preview: 'bg-pink-500' },
  { value: '#6B7280', label: 'Cinza', preview: 'bg-gray-500' },
  { value: '#374151', label: 'Cinza Escuro', preview: 'bg-gray-700' },
]

const availableIcons = [
  { value: 'store', label: 'Loja' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'car', label: 'Automotivo' },
  { value: 'heart', label: 'Saúde' },
  { value: 'graduation-cap', label: 'Educação' },
  { value: 'home', label: 'Casa e Jardim' },
  { value: 'shirt', label: 'Moda' },
  { value: 'briefcase', label: 'Serviços' },
  { value: 'wrench', label: 'Reparos' },
  { value: 'gamepad-2', label: 'Entretenimento' },
  { value: 'plane', label: 'Viagem' },
  { value: 'dumbbell', label: 'Fitness' },
  { value: 'palette', label: 'Arte' },
  { value: 'music', label: 'Música' },
  { value: 'camera', label: 'Fotografia' },
]

export function SegmentForm({
  segment,
  places,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: SegmentFormProps) {
  const isEditing = !!segment

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SegmentFormData>({
    resolver: zodResolver(segmentSchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
      order: 0,
      color: '#3B82F6',
    },
  })

  const watchedName = watch('name')
  const watchedColor = watch('color')

  React.useEffect(() => {
    if (isOpen && segment) {
      reset({
        name: segment.name,
        slug: segment.slug,
        description: segment.description,
        placeId: Number(segment.placeId),
        icon: segment.icon || '',
        color: segment.color || '#3B82F6',
        order: segment.order || 0,
        isActive: segment.isActive,
      })
    } else if (isOpen && !segment) {
      reset({
        name: '',
        slug: '',
        description: '',
        placeId: undefined as any,
        icon: '',
        color: '#3B82F6',
        order: 0,
        isActive: true,
      })
    }
  }, [isOpen, segment, reset])

  // Auto-gerar slug quando o nome mudar
  React.useEffect(() => {
    if (watchedName && !isEditing) {
      const generatedSlug = watchedName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      setValue('slug', generatedSlug)
    }
  }, [watchedName, isEditing, setValue])

  const selectedPlaceId = watch('placeId')
  const selectedIcon = watch('icon')

  const handleFormSubmit = async (data: SegmentFormData) => {
    try {
      const submitData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        placeId: data.placeId,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      }

      if (data.icon && data.icon.trim()) {
        submitData.icon = data.icon.trim()
      }

      if (data.color && data.color.trim()) {
        submitData.color = data.color.trim()
      }

      console.log('Segment form submit data:', submitData)

      if (isEditing) {
        await onSubmit({
          ...submitData,
          id: Number(segment.id),
        } as UpdateSegmentInput)
      } else {
        await onSubmit(submitData as CreateSegmentInput)
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
            <Tags className="h-5 w-5" />
            {isEditing ? 'Editar Segmento' : 'Criar Novo Segmento'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações do segmento abaixo.'
              : 'Preencha as informações para criar um novo segmento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome do Segmento *
              </Label>
              <Input
                id="name"
                placeholder="Nome do segmento"
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
                placeholder="slug-do-segmento"
                {...register('slug')}
                disabled={isLoading || !isEditing}
                readOnly={!isEditing}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
              {errors.slug && (
                <p className="text-sm text-red-600">{errors.slug.message}</p>
              )}
              {!isEditing && (
                <p className="text-xs text-gray-500">
                  O slug será gerado automaticamente baseado no nome
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
              placeholder="Descrição do segmento"
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
              <p className="text-sm text-red-600">{errors.placeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ícone</Label>
              <Select
                value={selectedIcon || ''}
                onValueChange={(value) => setValue('icon', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem ícone</SelectItem>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Cor</Label>
              <div className="flex gap-2">
                <Select
                  value={watchedColor || '#3B82F6'}
                  onValueChange={(value) => setValue('color', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: watchedColor || '#3B82F6' }}
                />
              </div>
              {errors.color && (
                <p className="text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order" className="text-sm font-medium">
              Ordem de Exibição
            </Label>
            <Input
              id="order"
              type="number"
              min="0"
              placeholder="0"
              {...register('order')}
              disabled={isLoading}
            />
            {errors.order && (
              <p className="text-sm text-red-600">{errors.order.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Ordem para organizar a exibição dos segmentos
            </p>
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
              Segmento ativo
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
