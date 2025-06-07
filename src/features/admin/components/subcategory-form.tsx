// src/features/admin/components/subcategory-form.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Loader2, Save, X } from 'lucide-react'
import type {
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from '../services/subcategories-service'
import type { Category, Place, Subcategory } from '@/types/graphql'
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

const subcategorySchema = z.object({
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
  categoryId: z.number().min(1, 'Categoria é obrigatória'),
  icon: z.string().optional(),
  order: z.coerce
    .number()
    .min(0, 'Ordem deve ser maior ou igual a zero')
    .optional(),
  keywords: z.string().optional(),
  isActive: z.boolean().optional(),
})

type SubcategoryFormData = z.infer<typeof subcategorySchema>

interface SubcategoryFormProps {
  subcategory?: Subcategory
  places: Array<Place>
  categories: Array<Category>
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    data: CreateSubcategoryInput | UpdateSubcategoryInput,
  ) => Promise<void>
  isLoading: boolean
}

const availableIcons = [
  { value: 'circle', label: 'Círculo' },
  { value: 'square', label: 'Quadrado' },
  { value: 'triangle', label: 'Triângulo' },
  { value: 'star', label: 'Estrela' },
  { value: 'heart', label: 'Coração' },
  { value: 'diamond', label: 'Diamante' },
  { value: 'hexagon', label: 'Hexágono' },
  { value: 'octagon', label: 'Octágono' },
  { value: 'tag', label: 'Tag' },
  { value: 'bookmark', label: 'Marcador' },
  { value: 'flag', label: 'Bandeira' },
  { value: 'pin', label: 'Pin' },
  { value: 'map-pin', label: 'Localização' },
  { value: 'target', label: 'Alvo' },
  { value: 'award', label: 'Prêmio' },
  { value: 'badge', label: 'Distintivo' },
  { value: 'shield', label: 'Escudo' },
  { value: 'key', label: 'Chave' },
  { value: 'lock', label: 'Cadeado' },
  { value: 'unlock', label: 'Desbloqueado' },
  { value: 'zap', label: 'Raio' },
  { value: 'cpu', label: 'Processador' },
  { value: 'globe', label: 'Globo' },
  { value: 'wifi', label: 'Wifi' },
  { value: 'smartphone', label: 'Smartphone' },
]

export function SubcategoryForm({
  subcategory,
  places,
  categories,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: SubcategoryFormProps) {
  const isEditing = !!subcategory

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    mode: 'onChange',
    defaultValues: {
      isActive: true,
      order: 0,
    },
  })

  const watchedName = watch('name')
  const selectedPlaceId = watch('placeId')
  const selectedCategoryId = watch('categoryId')
  const selectedIcon = watch('icon')

  React.useEffect(() => {
    if (isOpen && subcategory) {
      reset({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description,
        placeId: Number(subcategory.placeId),
        categoryId: Number(subcategory.categoryId),
        icon: subcategory.icon || undefined, // CORREÇÃO: usar undefined
        order: subcategory.order || 0,
        keywords: subcategory.keywords || undefined, // CORREÇÃO: usar undefined
        isActive: subcategory.isActive,
      })
    } else if (isOpen && !subcategory) {
      reset({
        name: '',
        slug: '',
        description: '',
        placeId: undefined as any,
        categoryId: undefined as any,
        icon: undefined, // CORREÇÃO: usar undefined
        order: 0,
        keywords: undefined, // CORREÇÃO: usar undefined
        isActive: true,
      })
    }
  }, [isOpen, subcategory, reset])

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

  // Filtrar categorias baseado no place selecionado
  const availableCategories = React.useMemo(() => {
    if (!selectedPlaceId) return []
    return categories.filter(
      (category) => Number(category.placeId) === selectedPlaceId,
    )
  }, [categories, selectedPlaceId])

  // Resetar categoria quando place mudar
  React.useEffect(() => {
    if (selectedPlaceId && !isEditing) {
      setValue('categoryId', undefined as any)
    }
  }, [selectedPlaceId, isEditing, setValue])

  const handleFormSubmit = async (data: SubcategoryFormData) => {
    try {
      const submitData: any = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        placeId: data.placeId,
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      }

      if (data.icon && data.icon.trim()) {
        submitData.icon = data.icon.trim()
      }

      if (data.keywords && data.keywords.trim()) {
        submitData.keywords = data.keywords.trim()
      }

      console.log('Subcategory form submit data:', submitData)

      if (isEditing) {
        await onSubmit({
          ...submitData,
          id: Number(subcategory.id),
        } as UpdateSubcategoryInput)
      } else {
        await onSubmit(submitData as CreateSubcategoryInput)
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

  const selectedCategory = availableCategories.find(
    (cat) => Number(cat.id) === selectedCategoryId,
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Editar Subcategoria' : 'Criar Nova Subcategoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edite as informações da subcategoria abaixo.'
              : 'Preencha as informações para criar uma nova subcategoria.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome da Subcategoria *
              </Label>
              <Input
                id="name"
                placeholder="Nome da subcategoria"
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
                placeholder="slug-da-subcategoria"
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
              placeholder="Descrição da subcategoria"
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
              <Label className="text-sm font-medium">Place *</Label>
              <Select
                value={selectedPlaceId ? selectedPlaceId.toString() : undefined} // CORREÇÃO: usar undefined
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria *</Label>
              <Select
                value={
                  selectedCategoryId ? selectedCategoryId.toString() : undefined
                } // CORREÇÃO: usar undefined
                onValueChange={(value) => setValue('categoryId', Number(value))}
                disabled={isLoading || availableCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedPlaceId
                        ? 'Selecione um place primeiro'
                        : availableCategories.length === 0
                          ? 'Nenhuma categoria disponível'
                          : 'Selecione uma categoria'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      {!selectedPlaceId
                        ? 'Selecione um place primeiro'
                        : 'Nenhuma categoria disponível'}
                    </SelectItem>
                  ) : (
                    availableCategories.map((category) => (
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
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
              {!selectedPlaceId && (
                <p className="text-xs text-amber-600">
                  Selecione um place para ver as categorias disponíveis.
                </p>
              )}
              {selectedPlaceId && availableCategories.length === 0 && (
                <p className="text-xs text-amber-600">
                  Nenhuma categoria encontrada para este place. Crie uma
                  categoria primeiro.
                </p>
              )}
            </div>
          </div>

          {/* Mostrar informações da categoria selecionada */}
          {selectedCategory && (
            <div className="p-3 bg-gray-50 rounded-md border">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: selectedCategory.color || '#22C55E',
                  }}
                />
                <span className="font-medium text-sm">
                  Categoria: {selectedCategory.name}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {selectedCategory.description}
              </p>
              {selectedCategory.segments &&
                selectedCategory.segments.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-gray-500">Segmentos:</span>
                    {selectedCategory.segments.map((segment) => (
                      <span
                        key={segment.id}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: segment.color || '#6B7280',
                          color: 'white',
                        }}
                      >
                        {segment.name}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ícone</Label>
              <Select
                value={selectedIcon || undefined} // CORREÇÃO: usar undefined
                onValueChange={(value) =>
                  setValue('icon', value === 'no-icon' ? undefined : value)
                } // CORREÇÃO: tratar valor especial
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ícone" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="no-icon">Sem ícone</SelectItem>{' '}
                  {/* CORREÇÃO: usar valor válido */}
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Ordem para organizar a exibição dentro da categoria
              </p>
            </div>
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

          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="isActive" className="text-sm font-medium">
              Subcategoria ativa
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
              disabled={
                isLoading ||
                !isValid ||
                places.length === 0 ||
                !selectedPlaceId ||
                availableCategories.length === 0
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
