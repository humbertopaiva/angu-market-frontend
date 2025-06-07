// src/features/admin/viewmodel/categories-viewmodel.ts
import { useState } from 'react'
import { toast } from 'sonner'
import { CategoriesService } from '../services/categories-service'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../services/categories-service'
import type { Category, Segment } from '@/types/graphql'

export class CategoriesViewModel {
  private categoriesService: CategoriesService
  private setLoading: (loading: boolean) => void
  private setCategories: (categories: Array<Category>) => void
  private categories: Array<Category>

  constructor(
    categoriesService: CategoriesService,
    setLoading: (loading: boolean) => void,
    setCategories: (categories: Array<Category>) => void,
    categories: Array<Category>,
  ) {
    this.categoriesService = categoriesService
    this.setLoading = setLoading
    this.setCategories = setCategories
    this.categories = categories
  }

  async loadCategories(): Promise<void> {
    try {
      this.setLoading(true)
      const categories = await this.categoriesService.getCategories()
      this.setCategories([...categories])
    } catch (error: any) {
      console.error('Error loading categories:', error)
      toast.error('Erro ao carregar categorias', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadCategoriesByPlace(placeId: number): Promise<void> {
    try {
      this.setLoading(true)
      const categories =
        await this.categoriesService.getCategoriesByPlace(placeId)
      this.setCategories([...categories])
    } catch (error: any) {
      console.error('Error loading categories by place:', error)
      toast.error('Erro ao carregar categorias do place', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async loadCategoriesBySegment(segmentId: number): Promise<void> {
    try {
      this.setLoading(true)
      const categories =
        await this.categoriesService.getCategoriesBySegment(segmentId)
      this.setCategories([...categories])
    } catch (error: any) {
      console.error('Error loading categories by segment:', error)
      toast.error('Erro ao carregar categorias do segmento', {
        description: this.getErrorMessage(error),
      })
    } finally {
      this.setLoading(false)
    }
  }

  async createCategory(input: CreateCategoryInput): Promise<void> {
    try {
      // Validar entrada
      const errors = this.categoriesService.validateCreateCategoryInput(input)
      if (errors.length > 0) {
        toast.error('Erro de validação', {
          description: errors.join(', '),
        })
        throw new Error(errors.join(', '))
      }

      this.setLoading(true)
      const newCategory = await this.categoriesService.createCategory(input)
      this.setCategories([...this.categories, newCategory])

      toast.success('Categoria criada com sucesso!', {
        description: `${newCategory.name} foi adicionada.`,
      })
    } catch (error: any) {
      console.error('Error creating category:', error)
      if (!error.message.includes('validação')) {
        toast.error('Erro ao criar categoria', {
          description: this.getErrorMessage(error),
        })
      }
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async updateCategory(input: UpdateCategoryInput): Promise<void> {
    try {
      this.setLoading(true)
      const updatedCategory = await this.categoriesService.updateCategory(input)
      const updatedCategories = this.categories.map((category) =>
        category.id === updatedCategory.id ? { ...updatedCategory } : category,
      )
      this.setCategories([...updatedCategories])

      toast.success('Categoria atualizada com sucesso!', {
        description: `${updatedCategory.name} foi atualizada.`,
      })
    } catch (error: any) {
      console.error('Error updating category:', error)
      toast.error('Erro ao atualizar categoria', {
        description: this.getErrorMessage(error),
      })
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  async deleteCategory(id: number, name: string): Promise<void> {
    try {
      this.setLoading(true)
      await this.categoriesService.deleteCategory(id)
      const filteredCategories = this.categories.filter(
        (category) => Number(category.id) !== id,
      )
      this.setCategories([...filteredCategories])

      toast.success('Categoria removida com sucesso!', {
        description: `${name} foi removida.`,
      })
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error('Erro ao remover categoria', {
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
    return this.categoriesService.generateSlugFromName(name)
  }

  /**
   * Verificar se slug está disponível
   */
  async checkSlugAvailability(
    slug: string,
    placeId: number,
    excludeCategoryId?: number,
  ): Promise<boolean> {
    try {
      return await this.categoriesService.isSlugAvailable(
        slug,
        placeId,
        excludeCategoryId,
      )
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
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
      return await this.categoriesService.searchCategories(filters)
    } catch (error) {
      console.error('Error searching categories:', error)
      return []
    }
  }

  /**
   * Formatar categoria para exibição
   */
  formatCategoryForDisplay(category: Category): any {
    return this.categoriesService.formatCategoryForDisplay(category)
  }

  /**
   * Obter cores disponíveis para categorias
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
   * Obter ícones disponíveis para categorias
   */
  getAvailableIcons(): Array<{ value: string; label: string }> {
    return [
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
  }

  /**
   * Validar dados antes de enviar
   */
  validateCategoryData(
    data: Partial<CreateCategoryInput | UpdateCategoryInput>,
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

    // MUDANÇA: Validar segmento único
    if (!data.segmentIds || data.segmentIds.length === 0) {
      errors.push('Segmento é obrigatório')
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
   * Obter categoria por ID
   */
  getCategoryById(id: string): Category | undefined {
    return this.categories.find((category) => category.id === id)
  }

  /**
   * Filtrar categorias por critérios
   */
  filterCategories(filters: {
    search?: string
    isActive?: boolean
    hasSubcategories?: boolean
    segmentId?: string
  }): Array<Category> {
    return this.categories.filter((category) => {
      // Filtro de busca
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

      // Filtro por ter subcategorias
      if (filters.hasSubcategories !== undefined) {
        const hasSubcategories = !!(
          category.subcategories && category.subcategories.length > 0
        )
        if (hasSubcategories !== filters.hasSubcategories) {
          return false
        }
      }

      // MUDANÇA: Filtro por segmento - verificar o primeiro (principal) segmento
      if (filters.segmentId) {
        const belongsToSegment = category.segments?.some(
          (segment) => segment.id === filters.segmentId,
        )
        if (!belongsToSegment) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Ordenar categorias
   */
  sortCategories(
    categories: Array<Category>,
    sortBy: 'name' | 'order' | 'created' = 'order',
  ): Array<Category> {
    return [...categories].sort((a, b) => {
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
   * MUDANÇA: Agrupar categorias por segmento - simplificado para segmento único
   */
  groupCategoriesBySegment(
    categories: Array<Category>,
  ): Record<string, Array<Category>> {
    const groups: Record<string, Array<Category>> = {}

    categories.forEach((category) => {
      // MUDANÇA: usar apenas o primeiro segmento (principal)
      const primarySegment = category.segments?.[0]
      const segmentName = primarySegment?.name || 'Sem segmento'

      groups[segmentName] = []

      groups[segmentName].push(category)
    })

    // Ordenar categorias dentro de cada grupo
    Object.keys(groups).forEach((segmentName) => {
      groups[segmentName] = this.sortCategories(groups[segmentName])
    })

    return groups
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
      return await this.categoriesService.getCategoriesStats(placeId)
    } catch (error) {
      console.error('Error getting categories stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withSubcategories: 0,
        withoutSubcategories: 0,
        bySegment: {},
      }
    }
  }

  /**
   * MUDANÇA: Obter segmento principal de uma categoria
   */
  getPrimarySegment(category: Category): Segment | null {
    return category.segments?.[0] || null
  }

  /**
   * MUDANÇA: Verificar se categoria tem segmento
   */
  hasSegment(category: Category): boolean {
    return !!(category.segments && category.segments.length > 0)
  }

  /**
   * MUDANÇA: Filtrar categorias por segmento específico
   */
  getCategoriesForSegment(segmentId: string): Array<Category> {
    return this.categories.filter((category) =>
      category.segments?.some((segment) => segment.id === segmentId),
    )
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

export function useCategoriesViewModel() {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Array<Category>>([])
  const categoriesService = new CategoriesService()

  const viewModel = new CategoriesViewModel(
    categoriesService,
    setIsLoading,
    (newCategories) => setCategories([...newCategories]),
    categories,
  )

  return {
    viewModel,
    isLoading,
    categories,
  }
}
