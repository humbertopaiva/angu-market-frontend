// src/features/admin/components/category-form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Folder, Loader2, Save, X } from 'lucide-react'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../services/categories-service'
import type { Category, Place, Segment } from '@/types/graphql'
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
import { Checkbox } from '@/components/ui/checkbox'

const categorySchema = z.object({
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
  keywords: z.string().optional(),
  segmentIds: z.array(z.number()).optional(),
  isActive: z.boolean().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: Category
  places: Array<Place>
  segments: Array<Segment>
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>
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
  { value: 'utensils', label: 'Alimentação' },
  { value: 'shopping-bag', label: 'Compras' },
  { value: 'car', label: 'Automotivo' },
  { value: 'stethoscope', label: 'Saúde' },
  { value: 'book', label: 'Educação' },
  { value: 'home', label: 'Casa' },
  { value: 'shirt', label: 'Roupas' },
  { value: 'laptop', label: 'Tecnologia' },
  { value: 'dumbbell', label: 'Fitness' },
  { value: 'palette', label: 'Arte' },
  { value: 'music', label: 'Música' },
  { value: 'camera', label: 'Fotografia' },
  { value: 'coffee', label: 'Cafés' },
  { value: 'scissors', label: 'Beleza' },
  { value: 'wrench', label: 'Reparos' },
  { value: 'plane', label: 'Viagem' },
  { value: 'gamepad-2', label: 'Entretenimento' },
  { value: 'briefcase', label: 'Serviços' },
  { value: 'flower', label: 'Plantas' },
  { value: 'baby', label: 'Infantil' },
]

export function CategoryForm({
  category,
  places,
  segments,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CategoryFormProps) {
  const isEditing = !!category
  const [selectedSegmentIds, setSelectedSegmentIds] = React.useState<
    Array<number>
  >([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
      order: 0,
      color: '#22C55E',
      segmentIds: [],
    },
  })

  const watchedName = watch('name')
  const watchedColor = watch('color')
  const selectedPlaceId = watch('placeId')
  const selectedIcon = watch('icon')

  React.useEffect(() => {
    if (isOpen && category) {
      const categorySegmentIds =
        category.segments?.map((s) => Number(s.id)) || []
      setSelectedSegmentIds(categorySegmentIds)

      reset({
        name: category.name,
        slug: category.slug,
        description: category.description,
        placeId: Number(category.placeId),
        icon: category.icon || undefined,
        color: category.color || '#22C55E',
        order: category.order || 0,
        keywords: category.keywords || undefined,
        segmentIds: categorySegmentIds,
        isActive: category.isActive,
      })
    } else if (isOpen && !category) {
      setSelectedSegmentIds([])
      reset({
        name: '',
        slug: '',
        description: '',
        placeId: undefined as any,
        icon: undefined,
        color: '#22C55E',
        order: 0,
        keywords: undefined,
        segmentIds: [],
        isActive: true,
      })
    }
  }, [isOpen, category, reset])

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

  // Filtrar segmentos por place selecionado
  const availableSegments = React.useMemo(() => {
    if (!selectedPlaceId) return []
    return segments.filter(
      (segment) => Number(segment.placeId) === selectedPlaceId,
    )
  }, [segments, selectedPlaceId])

  // Atualizar segmentos selecionados quando place mudar
  React.useEffect(() => {
    if (selectedPlaceId && !isEditing) {
      setSelectedSegmentIds([])
      setValue('segmentIds', [])
    }
  }, [selectedPlaceId, isEditing, setValue])

  const handleSegmentToggle = (segmentId: number, checked: boolean) => {
    let newSelectedIds: Array<number>

    if (checked) {
      newSelectedIds = [...selectedSegmentIds, segmentId]
    } else {
      newSelectedIds = selectedSegmentIds.filter((id) => id !== segmentId)
    }

    setSelectedSegmentIds(newSelectedIds)
    setValue('segmentIds', newSelectedIds)
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      const submitData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        placeId: data.placeId,
        isActive: data.isActive ?? true,
        order: data.order || 0,
        segmentIds:
          selectedSegmentIds.length > 0 ? selectedSegmentIds : undefined,
      }

      if (data.icon && data.icon.trim()) {
        submitData.icon = data.icon.trim()
      }

      if (data.color && data.color.trim()) {
        submitData.color = data.color.trim()
      }

      if (data.keywords && data.keywords.trim()) {
        submitData.keywords = data.keywords.trim()
      }

      console.log('Category form submit data:', submitData)

      if (isEditing) {
        await onSubmit({
          ...submitData,
          id: Number(category.id),
        } as UpdateCategoryInput)
      } else {
        await onSubmit(submitData as CreateCategoryInput)
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {isEditing ? 'Editar Categoria' : 'Criar Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações da categoria abaixo.'
              : 'Preencha as informações para criar uma nova categoria.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome da Categoria *
              </Label>
              <Input
                id="name"
                placeholder="Nome da categoria"
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
                placeholder="slug-da-categoria"
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
              placeholder="Descrição da categoria"
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
              value={selectedPlaceId ? selectedPlaceId.toString() : undefined}
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

          {/* Segmentos - só mostra se tem place selecionado */}
          {selectedPlaceId && availableSegments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Segmentos (Opcional)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {availableSegments.map((segment) => (
                  <div key={segment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`segment-${segment.id}`}
                      checked={selectedSegmentIds.includes(Number(segment.id))}
                      onCheckedChange={(checked) =>
                        handleSegmentToggle(
                          Number(segment.id),
                          checked as boolean,
                        )
                      }
                    />
                    <Label
                      htmlFor={`segment-${segment.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {segment.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Selecione os segmentos aos quais esta categoria pertence
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ícone</Label>
              <Select
                value={selectedIcon || undefined}
                onValueChange={(value) =>
                  setValue('icon', value === 'no-icon' ? undefined : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-icon">Sem ícone</SelectItem>
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
                  value={watchedColor || '#22C55E'}
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
                  style={{ backgroundColor: watchedColor || '#22C55E' }}
                />
              </div>
              {errors.color && (
                <p className="text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm font-medium">
                Palavras-chave
              </Label>
              <Input
                id="keywords"
                placeholder="palavras, separadas, por, vírgula"
                {...register('keywords')}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Palavras-chave para facilitar buscas (separadas por vírgula)
              </p>
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
              Categoria ativa
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
