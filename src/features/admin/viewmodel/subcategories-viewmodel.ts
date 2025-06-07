// src/features/admin/viewmodel/subcategories-viewmodel.ts
import { useState } from 'react'
import { toast } from 'sonner'
import { SubcategoriesService } from '../services/subcategories-service'
import type {
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from '../services/subcategories-service'
import type { Category, Subcategory } from '@/types/graphql'

export class SubcategoriesViewModel {
  private subcategoriesService: SubcategoriesService
  private setLoading: (loading: boolean) => void
  private setSubcategories: (subcategories: Array<Subcategory>) => void
  private subcategories: Array<Subcategory>

  constructor(
    subcategoriesService: SubcategoriesService,
    setLoading: (loading: boolean) => void,
    setSubcategories: (subcategories: Array<Subcategory>) => void,
    subcategories: Array<Subcategory>,
  ) {
    this.subcategoriesService = subcategoriesService
    this.setLoading = setLoading
    this.setSubcategories = setSubcategories
    this.subcategories = subcategories
  }

  async loadSubcategories(): Promise<void> {
    try {
      this.setLoading(true)
      const subcategories = await this.subcategoriesService.getSubcategories()
      this.setSubcategories([...subcategories])
    } catch (error: any) {
      console.error('Error loading subcategories:', error)
      toast.error('Erro ao carregar subcategorias', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadSubcategoriesByPlace(placeId: number): Promise<void> {
    try {
      this.setLoading(true)
      const subcategories =
        await this.subcategoriesService.getSubcategoriesByPlace(placeId)
      this.setSubcategories([...subcategories])
    } catch (error: any) {
      console.error('Error loading subcategories by place:', error)
      toast.error('Erro ao carregar subcategorias do place', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadSubcategoriesByCategory(categoryId: number): Promise<void> {
    try {
      this.setLoading(true)
      const subcategories =
        await this.subcategoriesService.getSubcategoriesByCategory(categoryId)
      this.setSubcategories([...subcategories])
    } catch (error: any) {
      console.error('Error loading subcategories by category:', error)
      toast.error('Erro ao carregar subcategorias da categoria', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async createSubcategory(input: CreateSubcategoryInput): Promise<void> {
    try {
      // Validar entrada
      const errors =
        this.subcategoriesService.validateCreateSubcategoryInput(input)
      if (errors.length > 0) {
        toast.error('Erro de validação', {
          description: errors.join(', '),
        })
        throw new Error(errors.join(', '))
      }

      this.setLoading(true)
      const newSubcategory =
        await this.subcategoriesService.createSubcategory(input)
      this.setSubcategories([...this.subcategories, newSubcategory])

      toast.success('Subcategoria criada com sucesso!', {
        description: `${newSubcategory.name} foi adicionada.`,
      })
    } catch (error: any) {
      console.error('Error creating subcategory:', error)
      if (!error.message.includes('validação')) {
        toast.error('Erro ao criar subcategoria', {
          description: this.getErrorMessage(error),
        })
      }
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async updateSubcategory(input: UpdateSubcategoryInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedSubcategory =
        await this.subcategoriesService.updateSubcategory(input)
      const updatedSubcategories = this.subcategories.map((subcategory) =>
        subcategory.id === updatedSubcategory.id
          ? { ...updatedSubcategory }
          : subcategory,
      )
      this.setSubcategories([...updatedSubcategories])

      toast.success('Subcategoria atualizada com sucesso!', {
        description: `${updatedSubcategory.name} foi atualizada.`,
      })
    } catch (error: any) {
      console.error('Error updating subcategory:', error)
      toast.error('Erro ao atualizar subcategoria', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async deleteSubcategory(id: number, name: string): Promise<void> {
    try {
      this.setLoading(true)
      await this.subcategoriesService.deleteSubcategory(id)
      const filteredSubcategories = this.subcategories.filter(
        (subcategory) => Number(subcategory.id) !== id,
      )
      this.setSubcategories([...filteredSubcategories])

      toast.success('Subcategoria removida com sucesso!', {
        description: `${name} foi removida.`,
      })
    } catch (error: any) {
      console.error('Error deleting subcategory:', error)
      toast.error('Erro ao remover subcategoria', {
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
    return this.subcategoriesService.generateSlugFromName(name)
  }

  /**
   * Verificar se slug está disponível
   */
  async checkSlugAvailability(
    slug: string,
    placeId: number,
    excludeSubcategoryId?: number,
  ): Promise<boolean> {
    try {
      return await this.subcategoriesService.isSlugAvailable(
        slug,
        placeId,
        excludeSubcategoryId,
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
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
      return await this.subcategoriesService.searchSubcategories(filters)
    } catch (error) {
      console.error('Error searching subcategories:', error)
      return []
    }
  }

  /**
   * Formatar subcategoria para exibição
   */
  formatSubcategoryForDisplay(subcategory: Subcategory): any {
    return this.subcategoriesService.formatSubcategoryForDisplay(subcategory)
  }

  /**
   * Obter ícones disponíveis para subcategorias
   */
  getAvailableIcons(): Array<{ value: string; label: string }> {
    return [
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
    ]
  }

  /**
   * Validar dados antes de enviar
   */
  validateSubcategoryData(
    data: Partial<CreateSubcategoryInput | UpdateSubcategoryInput>,
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

    if (!data.categoryId || data.categoryId < 1) {
      errors.push('Categoria é obrigatória')
    }

    if (data.order !== undefined && (isNaN(data.order) || data.order < 0)) {
      errors.push('Ordem deve ser um número maior ou igual a zero')
    }

    return errors
  }

  /**
   * Obter subcategoria por ID
   */
  getSubcategoryById(id: string): Subcategory | undefined {
    return this.subcategories.find((subcategory) => subcategory.id === id)
  }

  /**
   * Filtrar subcategorias por critérios
   */
  filterSubcategories(filters: {
    search?: string
    isActive?: boolean
    hasCompanies?: boolean
    categoryId?: string
  }): Array<Subcategory> {
    return this.subcategories.filter((subcategory) => {
      // Filtro de busca
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

      // Filtro por ter empresas
      if (filters.hasCompanies !== undefined) {
        const hasCompanies = !!(
          subcategory.companies && subcategory.companies.length > 0
        )
        if (hasCompanies !== filters.hasCompanies) {
          return false
        }
      }

      // Filtro por categoria
      if (filters.categoryId) {
        if (subcategory.category.id !== filters.categoryId) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Ordenar subcategorias
   */
  sortSubcategories(
    subcategories: Array<Subcategory>,
    sortBy: 'name' | 'order' | 'created' = 'order',
  ): Array<Subcategory> {
    return [...subcategories].sort((a, b) => {
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

  /**
   * Agrupar subcategorias por categoria
   */
  groupSubcategoriesByCategory(
    subcategories: Array<Subcategory>,
  ): Record<string, Array<Subcategory>> {
    return this.subcategoriesService.groupSubcategoriesByCategory(subcategories)
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
      return await this.subcategoriesService.getSubcategoriesStats(placeId)
    } catch (error) {
      console.error('Error getting subcategories stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withCompanies: 0,
        withoutCompanies: 0,
        byCategory: {},
      }
    }
  }

  /**
   * Filtrar subcategorias por categoria específica
   */
  getSubcategoriesForCategory(categoryId: string): Array<Subcategory> {
    return this.subcategories.filter(
      (subcategory) => subcategory.category.id === categoryId,
    )
  }

  /**
   * Verificar se categoria pode ser deletada (não tem subcategorias)
   */
  canDeleteCategory(categoryId: string): boolean {
    return !this.subcategories.some(
      (subcategory) => subcategory.category.id === categoryId,
    )
  }

  /**
   * Obter próxima ordem disponível para uma categoria
   */
  getNextOrderForCategory(categoryId: string): number {
    const categorySubcategories = this.getSubcategoriesForCategory(categoryId)

    if (categorySubcategories.length === 0) {
      return 1
    }

    const maxOrder = Math.max(
      ...categorySubcategories.map((sub) => sub.order || 0),
    )

    return maxOrder + 1
  }

  /**
   * Validar se categoria pertence ao mesmo place da subcategoria
   */
  validateCategoryForPlace(category: Category, placeId: number): boolean {
    return Number(category.placeId) === placeId
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

export function useSubcategoriesViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [subcategories, setSubcategories] = useState<Array<Subcategory>>([])
  const subcategoriesService = new SubcategoriesService()

  const viewModel = new SubcategoriesViewModel(
    subcategoriesService,
    setIsLoading,
    (newSubcategories) => setSubcategories([...newSubcategories]),
    subcategories,
  )

  return {
    viewModel,
    isLoading,
    subcategories,
  }
}
