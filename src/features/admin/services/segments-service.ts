// src/features/admin/services/segments-service.ts
import {
  CREATE_SEGMENT_MUTATION,
  DELETE_SEGMENT_MUTATION,
  GET_SEGMENTS_BY_PLACE_QUERY,
  GET_SEGMENTS_QUERY,
  GET_SEGMENT_BY_ID_QUERY,
  UPDATE_SEGMENT_MUTATION,
} from './segments-queries'

import type {
  CreateSegmentInput,
  Segment,
  UpdateSegmentInput,
} from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export type { CreateSegmentInput, UpdateSegmentInput }

export class SegmentsService {
  /**
   * Criar novo segmento
   */
  async createSegment(input: CreateSegmentInput): Promise<Segment> {
    try {
      const cleanInput = this.cleanSegmentInput(input)

      console.log('Creating segment with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_SEGMENT_MUTATION,
        variables: { createSegmentInput: cleanInput },
        refetchQueries: [
          { query: GET_SEGMENTS_QUERY },
          {
            query: GET_SEGMENTS_BY_PLACE_QUERY,
            variables: { placeId: cleanInput.placeId },
          },
        ],
      })

      return data.createSegment as Segment
    } catch (error) {
      console.error('Create segment error:', error)
      throw error
    }
  }

  /**
   * Atualizar segmento existente
   */
  async updateSegment(input: UpdateSegmentInput): Promise<Segment> {
    try {
      const cleanInput = this.cleanUpdateSegmentInput(input)

      console.log('Updating segment with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_SEGMENT_MUTATION,
        variables: { updateSegmentInput: cleanInput },
        refetchQueries: [{ query: GET_SEGMENTS_QUERY }],
      })

      return data.updateSegment as Segment
    } catch (error) {
      console.error('Update segment error:', error)
      throw error
    }
  }

  /**
   * Deletar segmento
   */
  async deleteSegment(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_SEGMENT_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_SEGMENTS_QUERY }],
      })
    } catch (error) {
      console.error('Delete segment error:', error)
      throw error
    }
  }

  /**
   * Buscar todos os segmentos
   */
  async getSegments(): Promise<Array<Segment>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SEGMENTS_QUERY,
        fetchPolicy: 'cache-first',
      })

      return data.segments as Array<Segment>
    } catch (error) {
      console.error('Get segments error:', error)
      throw error
    }
  }

  /**
   * Buscar segmento por ID
   */
  async getSegmentById(id: string): Promise<Segment> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SEGMENT_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.segment as Segment
    } catch (error) {
      console.error('Get segment by id error:', error)
      throw error
    }
  }

  /**
   * Buscar segmentos por place
   */
  async getSegmentsByPlace(placeId: number): Promise<Array<Segment>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SEGMENTS_BY_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.segmentsByPlace as Array<Segment>
    } catch (error) {
      console.error('Get segments by place error:', error)
      throw error
    }
  }

  /**
   * Limpar dados de entrada para criação de segmento
   */
  private cleanSegmentInput(input: CreateSegmentInput): CreateSegmentInput {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([key, value]) => {
        // Remover valores undefined, null ou strings vazias
        if (value === undefined || value === null || value === '') {
          return false
        }

        // Remover arrays vazios
        if (Array.isArray(value) && value.length === 0) {
          return false
        }

        return true
      }),
    ) as CreateSegmentInput

    return cleanInput
  }

  /**
   * Limpar dados de entrada para atualização de segmento
   */
  private cleanUpdateSegmentInput(
    input: UpdateSegmentInput,
  ): UpdateSegmentInput {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([key, value]) => {
        // Sempre manter o ID
        if (key === 'id') return true

        // Remover valores undefined, null ou strings vazias
        if (value === undefined || value === null || value === '') {
          return false
        }

        // Remover arrays vazios
        if (Array.isArray(value) && value.length === 0) {
          return false
        }

        return true
      }),
    ) as UpdateSegmentInput

    return cleanInput
  }

  /**
   * Validar dados de entrada para criação de segmento
   */
  validateCreateSegmentInput(input: CreateSegmentInput): Array<string> {
    const errors: Array<string> = []

    if (!input.name || input.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }

    if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens')
    }

    if (!input.description || input.description.trim().length < 1) {
      errors.push('Descrição é obrigatória')
    }

    if (!input.placeId || input.placeId < 1) {
      errors.push('Place é obrigatório')
    }

    if (input.color && !/^#[0-9A-F]{6}$/i.test(input.color)) {
      errors.push('Cor deve ser um código hexadecimal válido (ex: #FF5722)')
    }

    return errors
  }

  /**
   * Gerar slug a partir do nome
   */
  generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplos
      .replace(/^-|-$/g, '') // Remove hífens no início/fim
  }

  /**
   * Verificar se slug está disponível
   */
  async isSlugAvailable(
    slug: string,
    placeId: number,
    excludeSegmentId?: number,
  ): Promise<boolean> {
    try {
      const segments = await this.getSegmentsByPlace(placeId)

      return !segments.some(
        (segment) =>
          segment.slug === slug &&
          (!excludeSegmentId || Number(segment.id) !== excludeSegmentId),
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }

  /**
   * Formatar segmento para exibição
   */
  formatSegmentForDisplay(segment: Segment): any {
    return {
      id: segment.id,
      name: segment.name,
      slug: segment.slug,
      description: segment.description,
      icon: segment.icon || 'Sem ícone',
      color: segment.color || '#6B7280',
      order: segment.order || 0,
      placeName: segment.place.name || 'Place não encontrado',
      categoriesCount: segment.categories?.length || 0,
      isActive: segment.isActive,
      createdAt: new Date(segment.createdAt).toLocaleDateString('pt-BR'),
      updatedAt: new Date(segment.updatedAt).toLocaleDateString('pt-BR'),
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
      let segments: Array<Segment>

      if (filters.placeId) {
        segments = await this.getSegmentsByPlace(filters.placeId)
      } else {
        segments = await this.getSegments()
      }

      // Aplicar filtros
      return segments.filter((segment) => {
        // Filtro de busca por texto
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

        return true
      })
    } catch (error) {
      console.error('Error searching segments:', error)
      throw error
    }
  }
}
