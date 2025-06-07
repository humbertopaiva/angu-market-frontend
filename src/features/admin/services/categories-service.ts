// src/features/admin/services/categories-service.ts
import {
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  GET_CATEGORIES_BY_PLACE_QUERY,
  GET_CATEGORIES_BY_SEGMENT_QUERY,
  GET_CATEGORIES_QUERY,
  GET_CATEGORY_BY_ID_QUERY,
  UPDATE_CATEGORY_MUTATION,
} from './categories-queries'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export type { CreateCategoryInput, UpdateCategoryInput }

export class CategoriesService {
  /**
   * Criar nova categoria
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    try {
      const cleanInput = this.cleanCategoryInput(input)

      console.log('Creating category with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_CATEGORY_MUTATION,
        variables: { createCategoryInput: cleanInput },
        refetchQueries: [
          { query: GET_CATEGORIES_QUERY },
          {
            query: GET_CATEGORIES_BY_PLACE_QUERY,
            variables: { placeId: cleanInput.placeId },
          },
        ],
      })

      return data.createCategory as Category
    } catch (error) {
      console.error('Create category error:', error)
      throw error
    }
  }

  /**
   * Atualizar categoria existente
   */
  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    try {
      const cleanInput = this.cleanUpdateCategoryInput(input)

      console.log('Updating category with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_CATEGORY_MUTATION,
        variables: { updateCategoryInput: cleanInput },
        refetchQueries: [{ query: GET_CATEGORIES_QUERY }],
      })

      return data.updateCategory as Category
    } catch (error) {
      console.error('Update category error:', error)
      throw error
    }
  }

  /**
   * Deletar categoria
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_CATEGORY_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_CATEGORIES_QUERY }],
      })
    } catch (error) {
      console.error('Delete category error:', error)
      throw error
    }
  }

  /**
   * Buscar todas as categorias
   */
  async getCategories(): Promise<Array<Category>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CATEGORIES_QUERY,
        fetchPolicy: 'cache-first',
      })

      return data.categories.edges.map(
        (edge: any) => edge.node,
      ) as Array<Category>
    } catch (error) {
      console.error('Get categories error:', error)
      throw error
    }
  }

  /**
   * Buscar categoria por ID
   */
  async getCategoryById(id: string): Promise<Category> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CATEGORY_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.category as Category
    } catch (error) {
      console.error('Get category by id error:', error)
      throw error
    }
  }

  /**
   * Buscar categorias por place
   */
  async getCategoriesByPlace(placeId: number): Promise<Array<Category>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CATEGORIES_BY_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.categoriesByPlace as Array<Category>
    } catch (error) {
      console.error('Get categories by place error:', error)
      throw error
    }
  }

  /**
   * Buscar categorias por segmento
   */
  async getCategoriesBySegment(segmentId: number): Promise<Array<Category>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CATEGORIES_BY_SEGMENT_QUERY,
        variables: { segmentId },
        fetchPolicy: 'cache-first',
      })

      return data.categoriesBySegment as Array<Category>
    } catch (error) {
      console.error('Get categories by segment error:', error)
      throw error
    }
  }

  /**
   * Limpar dados de entrada para criação de categoria
   */
  private cleanCategoryInput(input: CreateCategoryInput): CreateCategoryInput {
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
    ) as CreateCategoryInput

    return cleanInput
  }

  /**
   * Limpar dados de entrada para atualização de categoria
   */
  private cleanUpdateCategoryInput(
    input: UpdateCategoryInput,
  ): UpdateCategoryInput {
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
    ) as UpdateCategoryInput

    return cleanInput
  }

  /**
   * Validar dados de entrada para criação de categoria
   */
  validateCreateCategoryInput(input: CreateCategoryInput): Array<string> {
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
    excludeCategoryId?: number,
  ): Promise<boolean> {
    try {
      const categories = await this.getCategoriesByPlace(placeId)

      return !categories.some(
        (category) =>
          category.slug === slug &&
          (!excludeCategoryId || Number(category.id) !== excludeCategoryId),
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }

  /**
   * Formatar categoria para exibição
   */
  formatCategoryForDisplay(category: Category): any {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || 'Sem ícone',
      color: category.color || '#6B7280',
      order: category.order || 0,
      keywords: category.keywords || 'Nenhuma',
      placeName: category.place.name || 'Place não encontrado',
      segmentsCount: category.segments?.length || 0,
      subcategoriesCount: category.subcategories?.length || 0,
      companiesCount: category.companies?.length || 0,
      isActive: category.isActive,
      createdAt: new Date(category.createdAt).toLocaleDateString('pt-BR'),
      updatedAt: new Date(category.updatedAt).toLocaleDateString('pt-BR'),
    }
  }

  /**
   * Buscar categorias com filtros
   */
  async searchCategories(filters: {
    search?: string
    placeId?: number
    segmentId?: number
    isActive?: boolean
  }): Promise<Array<Category>> {
    try {
      let categories: Array<Category>

      if (filters.segmentId) {
        categories = await this.getCategoriesBySegment(filters.segmentId)
      } else if (filters.placeId) {
        categories = await this.getCategoriesByPlace(filters.placeId)
      } else {
        categories = await this.getCategories()
      }

      // Aplicar filtros
      return categories.filter((category) => {
        // Filtro de busca por texto
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          const searchable = [
            category.name,
            category.description,
            category.place.name || '',
            category.slug,
            category.keywords || '',
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
          category.isActive !== filters.isActive
        ) {
          return false
        }

        return true
      })
    } catch (error) {
      console.error('Error searching categories:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas das categorias
   */
  async getCategoriesStats(placeId?: number): Promise<{
    total: number
    active: number
    inactive: number
    withSubcategories: number
    withoutSubcategories: number
    bySegment: Record<string, number>
  }> {
    try {
      const categories = placeId
        ? await this.getCategoriesByPlace(placeId)
        : await this.getCategories()

      const stats = {
        total: categories.length,
        active: categories.filter((c) => c.isActive).length,
        inactive: categories.filter((c) => !c.isActive).length,
        withSubcategories: categories.filter(
          (c) => c.subcategories && c.subcategories.length > 0,
        ).length,
        withoutSubcategories: categories.filter(
          (c) => !c.subcategories || c.subcategories.length === 0,
        ).length,
        bySegment: {} as Record<string, number>,
      }

      // Estatísticas por segmento
      categories.forEach((category) => {
        if (category.segments && category.segments.length > 0) {
          category.segments.forEach((segment) => {
            const segmentName = segment.name || 'Sem segmento'
            stats.bySegment[segmentName] =
              (stats.bySegment[segmentName] || 0) + 1
          })
        } else {
          stats.bySegment['Sem segmento'] =
            (stats.bySegment['Sem segmento'] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting categories stats:', error)
      throw error
    }
  }
}
