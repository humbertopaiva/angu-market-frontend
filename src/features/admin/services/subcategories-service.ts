// src/features/admin/services/subcategories-service.ts
import {
  CREATE_SUBCATEGORY_MUTATION,
  DELETE_SUBCATEGORY_MUTATION,
  GET_SUBCATEGORIES_BY_CATEGORY_QUERY,
  GET_SUBCATEGORIES_BY_PLACE_QUERY,
  GET_SUBCATEGORIES_QUERY,
  GET_SUBCATEGORY_BY_ID_QUERY,
  UPDATE_SUBCATEGORY_MUTATION,
} from './subcategories-queries'
import type {
  CreateSubcategoryInput,
  Subcategory,
  UpdateSubcategoryInput,
} from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export type { CreateSubcategoryInput, UpdateSubcategoryInput }

export class SubcategoriesService {
  /**
   * Criar nova subcategoria
   */
  async createSubcategory(input: CreateSubcategoryInput): Promise<Subcategory> {
    try {
      const cleanInput = this.cleanSubcategoryInput(input)

      console.log('Creating subcategory with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_SUBCATEGORY_MUTATION,
        variables: { createSubcategoryInput: cleanInput },
        refetchQueries: [
          { query: GET_SUBCATEGORIES_QUERY },
          {
            query: GET_SUBCATEGORIES_BY_PLACE_QUERY,
            variables: { placeId: cleanInput.placeId },
          },
          {
            query: GET_SUBCATEGORIES_BY_CATEGORY_QUERY,
            variables: { categoryId: cleanInput.categoryId },
          },
        ],
      })

      return data.createSubcategory as Subcategory
    } catch (error) {
      console.error('Create subcategory error:', error)
      throw error
    }
  }

  /**
   * Atualizar subcategoria existente
   */
  async updateSubcategory(input: UpdateSubcategoryInput): Promise<Subcategory> {
    try {
      const cleanInput = this.cleanUpdateSubcategoryInput(input)

      console.log('Updating subcategory with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_SUBCATEGORY_MUTATION,
        variables: { updateSubcategoryInput: cleanInput },
        refetchQueries: [{ query: GET_SUBCATEGORIES_QUERY }],
      })

      return data.updateSubcategory as Subcategory
    } catch (error) {
      console.error('Update subcategory error:', error)
      throw error
    }
  }

  /**
   * Deletar subcategoria
   */
  async deleteSubcategory(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_SUBCATEGORY_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_SUBCATEGORIES_QUERY }],
      })
    } catch (error) {
      console.error('Delete subcategory error:', error)
      throw error
    }
  }

  /**
   * Buscar todas as subcategorias
   */
  async getSubcategories(): Promise<Array<Subcategory>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SUBCATEGORIES_QUERY,
        fetchPolicy: 'cache-first',
      })

      return data.subcategories.edges.map(
        (edge: any) => edge.node,
      ) as Array<Subcategory>
    } catch (error) {
      console.error('Get subcategories error:', error)
      throw error
    }
  }

  /**
   * Buscar subcategoria por ID
   */
  async getSubcategoryById(id: string): Promise<Subcategory> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SUBCATEGORY_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.subcategory as Subcategory
    } catch (error) {
      console.error('Get subcategory by id error:', error)
      throw error
    }
  }

  /**
   * Buscar subcategorias por place
   */
  async getSubcategoriesByPlace(placeId: number): Promise<Array<Subcategory>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SUBCATEGORIES_BY_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.subcategoriesByPlace as Array<Subcategory>
    } catch (error) {
      console.error('Get subcategories by place error:', error)
      throw error
    }
  }

  /**
   * Buscar subcategorias por categoria
   */
  async getSubcategoriesByCategory(
    categoryId: number,
  ): Promise<Array<Subcategory>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SUBCATEGORIES_BY_CATEGORY_QUERY,
        variables: { categoryId },
        fetchPolicy: 'cache-first',
      })

      return data.subcategoriesByCategory as Array<Subcategory>
    } catch (error) {
      console.error('Get subcategories by category error:', error)
      throw error
    }
  }

  /**
   * Limpar dados de entrada para criação de subcategoria
   */
  private cleanSubcategoryInput(
    input: CreateSubcategoryInput,
  ): CreateSubcategoryInput {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([key, value]) => {
        // Remover valores undefined, null ou strings vazias
        if (value === undefined || value === null || value === '') {
          return false
        }

        return true
      }),
    ) as CreateSubcategoryInput

    return cleanInput
  }

  /**
   * Limpar dados de entrada para atualização de subcategoria
   */
  private cleanUpdateSubcategoryInput(
    input: UpdateSubcategoryInput,
  ): UpdateSubcategoryInput {
    const cleanInput = Object.fromEntries(
      Object.entries(input).filter(([key, value]) => {
        // Sempre manter o ID
        if (key === 'id') return true

        // Remover valores undefined, null ou strings vazias
        if (value === undefined || value === null || value === '') {
          return false
        }

        return true
      }),
    ) as UpdateSubcategoryInput

    return cleanInput
  }

  /**
   * Validar dados de entrada para criação de subcategoria
   */
  validateCreateSubcategoryInput(input: CreateSubcategoryInput): Array<string> {
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

    if (!input.categoryId || input.categoryId < 1) {
      errors.push('Categoria é obrigatória')
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
    excludeSubcategoryId?: number,
  ): Promise<boolean> {
    try {
      const subcategories = await this.getSubcategoriesByPlace(placeId)

      return !subcategories.some(
        (subcategory) =>
          subcategory.slug === slug &&
          (!excludeSubcategoryId ||
            Number(subcategory.id) !== excludeSubcategoryId),
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }

  /**
   * Formatar subcategoria para exibição
   */
  formatSubcategoryForDisplay(subcategory: Subcategory): any {
    return {
      id: subcategory.id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description,
      icon: subcategory.icon || 'Sem ícone',
      order: subcategory.order || 0,
      keywords: subcategory.keywords || 'Nenhuma',
      placeName: subcategory.place.name || 'Place não encontrado',
      categoryName: subcategory.category.name || 'Categoria não encontrada',
      companiesCount: subcategory.companies?.length || 0,
      isActive: subcategory.isActive,
      createdAt: new Date(subcategory.createdAt).toLocaleDateString('pt-BR'),
      updatedAt: new Date(subcategory.updatedAt).toLocaleDateString('pt-BR'),
    }
  }

  /**
   * Buscar subcategorias com filtros
   */
  async searchSubcategories(filters: {
    search?: string
    placeId?: number
    categoryId?: number
    isActive?: boolean
  }): Promise<Array<Subcategory>> {
    try {
      let subcategories: Array<Subcategory>

      if (filters.categoryId) {
        subcategories = await this.getSubcategoriesByCategory(
          filters.categoryId,
        )
      } else if (filters.placeId) {
        subcategories = await this.getSubcategoriesByPlace(filters.placeId)
      } else {
        subcategories = await this.getSubcategories()
      }

      // Aplicar filtros
      return subcategories.filter((subcategory) => {
        // Filtro de busca por texto
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase()
          const searchable = [
            subcategory.name,
            subcategory.description,
            subcategory.place.name || '',
            subcategory.category.name || '',
            subcategory.slug,
            subcategory.keywords || '',
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
          subcategory.isActive !== filters.isActive
        ) {
          return false
        }

        return true
      })
    } catch (error) {
      console.error('Error searching subcategories:', error)
      throw error
    }
  }

  /**
   * Obter estatísticas das subcategorias
   */
  async getSubcategoriesStats(placeId?: number): Promise<{
    total: number
    active: number
    inactive: number
    withCompanies: number
    withoutCompanies: number
    byCategory: Record<string, number>
  }> {
    try {
      const subcategories = placeId
        ? await this.getSubcategoriesByPlace(placeId)
        : await this.getSubcategories()

      const stats = {
        total: subcategories.length,
        active: subcategories.filter((s) => s.isActive).length,
        inactive: subcategories.filter((s) => !s.isActive).length,
        withCompanies: subcategories.filter(
          (s) => s.companies && s.companies.length > 0,
        ).length,
        withoutCompanies: subcategories.filter(
          (s) => !s.companies || s.companies.length === 0,
        ).length,
        byCategory: {} as Record<string, number>,
      }

      // Estatísticas por categoria
      subcategories.forEach((subcategory) => {
        const categoryName = subcategory.category.name || 'Sem categoria'
        stats.byCategory[categoryName] =
          (stats.byCategory[categoryName] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting subcategories stats:', error)
      throw error
    }
  }

  /**
   * Agrupar subcategorias por categoria
   */
  groupSubcategoriesByCategory(
    subcategories: Array<Subcategory>,
  ): Record<string, Array<Subcategory>> {
    const groups: Record<string, Array<Subcategory>> = {}

    subcategories.forEach((subcategory) => {
      const categoryName = subcategory.category.name || 'Sem categoria'

      groups[categoryName] ??= []
      groups[categoryName].push(subcategory)
    })

    // Ordenar subcategorias dentro de cada grupo
    Object.keys(groups).forEach((categoryName) => {
      groups[categoryName].sort((a, b) => {
        // Primeiro por ordem, depois por nome
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0)
        }
        return a.name.localeCompare(b.name)
      })
    })

    return groups
  }
}
