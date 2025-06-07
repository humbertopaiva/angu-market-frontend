// src/features/admin/viewmodel/segments-viewmodel.ts
import { useState } from 'react'
import { toast } from 'sonner'
import { SegmentsService } from '../services/segments-service'
import type {
  CreateSegmentInput,
  UpdateSegmentInput,
} from '../services/segments-service'
import type { Segment } from '@/types/graphql'

export class SegmentsViewModel {
  private segmentsService: SegmentsService
  private setLoading: (loading: boolean) => void
  private setSegments: (segments: Array<Segment>) => void
  private segments: Array<Segment>

  constructor(
    segmentsService: SegmentsService,
    setLoading: (loading: boolean) => void,
    setSegments: (segments: Array<Segment>) => void,
    segments: Array<Segment>,
  ) {
    this.segmentsService = segmentsService
    this.setLoading = setLoading
    this.setSegments = setSegments
    this.segments = segments
  }

  async loadSegments(): Promise<void> {
    try {
      this.setLoading(true)
      const segments = await this.segmentsService.getSegments()
      this.setSegments([...segments])
    } catch (error: any) {
      console.error('Error loading segments:', error)
      toast.error('Erro ao carregar segmentos', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadSegmentsByPlace(placeId: number): Promise<void> {
    try {
      this.setLoading(true)
      const segments = await this.segmentsService.getSegmentsByPlace(placeId)
      this.setSegments([...segments])
    } catch (error: any) {
      console.error('Error loading segments by place:', error)
      toast.error('Erro ao carregar segmentos do place', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async createSegment(input: CreateSegmentInput): Promise<void> {
    try {
      // Validar entrada
      const errors = this.segmentsService.validateCreateSegmentInput(input)
      if (errors.length > 0) {
        toast.error('Erro de validação', {
          description: errors.join(', '),
        })
        throw new Error(errors.join(', '))
      }

      this.setLoading(true)
      const newSegment = await this.segmentsService.createSegment(input)
      this.setSegments([...this.segments, newSegment])

      toast.success('Segmento criado com sucesso!', {
        description: `${newSegment.name} foi adicionado.`,
      })
    } catch (error: any) {
      console.error('Error creating segment:', error)
      if (!error.message.includes('validação')) {
        toast.error('Erro ao criar segmento', {
          description: this.getErrorMessage(error),
        })
      }
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async updateSegment(input: UpdateSegmentInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedSegment = await this.segmentsService.updateSegment(input)
      const updatedSegments = this.segments.map((segment) =>
        segment.id === updatedSegment.id ? { ...updatedSegment } : segment,
      )
      this.setSegments([...updatedSegments])

      toast.success('Segmento atualizado com sucesso!', {
        description: `${updatedSegment.name} foi atualizado.`,
      })
    } catch (error: any) {
      console.error('Error updating segment:', error)
      toast.error('Erro ao atualizar segmento', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async deleteSegment(id: number, name: string): Promise<void> {
    try {
      this.setLoading(true)
      await this.segmentsService.deleteSegment(id)
      const filteredSegments = this.segments.filter(
        (segment) => Number(segment.id) !== id,
      )
      this.setSegments([...filteredSegments])

      toast.success('Segmento removido com sucesso!', {
        description: `${name} foi removido.`,
      })
    } catch (error: any) {
      console.error('Error deleting segment:', error)
      toast.error('Erro ao remover segmento', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Gerar slug automaticamente a partir do nome
   */
  generateSlug(name: string): string {
    return this.segmentsService.generateSlugFromName(name)
  }

  /**
   * Verificar se slug está disponível
   */
  async checkSlugAvailability(
    slug: string,
    placeId: number,
    excludeSegmentId?: number,
  ): Promise<boolean> {
    try {
      return await this.segmentsService.isSlugAvailable(
        slug,
        placeId,
        excludeSegmentId,
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }

  /**
   * Buscar segmentos com filtros
   */
  async searchSegments(filters: {
    search?: string
    placeId?: number
    isActive?: boolean
  }): Promise<Array<Segment>> {
    try {
      return await this.segmentsService.searchSegments(filters)
    } catch (error) {
      console.error('Error searching segments:', error)
      return []
    }
  }

  /**
   * Formatar segmento para exibição
   */
  formatSegmentForDisplay(segment: Segment): any {
    return this.segmentsService.formatSegmentForDisplay(segment)
  }

  /**
   * Obter cores disponíveis para segmentos
   */
  getAvailableColors(): Array<{
    value: string
    label: string
    preview: string
  }> {
    return [
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
  }

  /**
   * Obter ícones disponíveis para segmentos
   */
  getAvailableIcons(): Array<{ value: string; label: string }> {
    return [
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
  }

  /**
   * Validar dados antes de enviar
   */
  validateSegmentData(
    data: Partial<CreateSegmentInput | UpdateSegmentInput>,
  ): Array<string> {
    const errors: Array<string> = []

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }

    if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens')
    }

    if (!data.description || data.description.trim().length < 1) {
      errors.push('Descrição é obrigatória')
    }

    if (!data.placeId || data.placeId < 1) {
      errors.push('Place é obrigatório')
    }

    if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
      errors.push('Cor deve ser um código hexadecimal válido')
    }

    if (data.order !== undefined && (isNaN(data.order) || data.order < 0)) {
      errors.push('Ordem deve ser um número maior ou igual a zero')
    }

    return errors
  }

  /**
   * Obter segmento por ID
   */
  getSegmentById(id: string): Segment | undefined {
    return this.segments.find((segment) => segment.id === id)
  }

  /**
   * Filtrar segmentos por critérios
   */
  filterSegments(filters: {
    search?: string
    isActive?: boolean
    hasCategories?: boolean
  }): Array<Segment> {
    return this.segments.filter((segment) => {
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchable = [
          segment.name,
          segment.description,
          segment.place.name || '',
          segment.slug,
        ]
          .join(' ')
          .toLowerCase()

        if (!searchable.includes(searchTerm)) {
          return false
        }
      }

      // Filtro por status ativo
      if (
        filters.isActive !== undefined &&
        segment.isActive !== filters.isActive
      ) {
        return false
      }

      // Filtro por ter categorias
      if (filters.hasCategories !== undefined) {
        const hasCategories = !!(
          segment.categories && segment.categories.length > 0
        )
        if (hasCategories !== filters.hasCategories) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Ordenar segmentos
   */
  sortSegments(
    segments: Array<Segment>,
    sortBy: 'name' | 'order' | 'created' = 'order',
  ): Array<Segment> {
    return [...segments].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'order':
          if (a.order !== b.order) {
            return (a.order || 0) - (b.order || 0)
          }
          return a.name.localeCompare(b.name)
        case 'created':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        default:
          return 0
      }
    })
  }

  private getErrorMessage(error: any): string {
    if (error?.graphQLErrors?.length > 0) {
      return error.graphQLErrors[0].message
    }
    if (error?.networkError?.message) {
      return 'Erro de conexão com o servidor'
    }
    return 'Erro interno do servidor'
  }
}

export function useSegmentsViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [segments, setSegments] = useState<Array<Segment>>([])
  const segmentsService = new SegmentsService()

  const viewModel = new SegmentsViewModel(
    segmentsService,
    setIsLoading,
    (newSegments) => setSegments([...newSegments]),
    segments,
  )

  return {
    viewModel,
    isLoading,
    segments,
  }
}
