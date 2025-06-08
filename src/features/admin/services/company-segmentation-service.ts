import { gql } from '@apollo/client'
import type { Company } from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

// Mutations para atrelar empresas a segmentos/categorias
const ASSIGN_COMPANY_TO_SEGMENT_MUTATION = gql`
  mutation AssignCompanyToSegment($companyId: Int!, $segmentId: Int!) {
    assignCompanyToSegment(companyId: $companyId, segmentId: $segmentId) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

const ASSIGN_COMPANY_TO_CATEGORY_MUTATION = gql`
  mutation AssignCompanyToCategory($companyId: Int!, $categoryId: Int!) {
    assignCompanyToCategory(companyId: $companyId, categoryId: $categoryId) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

const ASSIGN_COMPANY_TO_SUBCATEGORY_MUTATION = gql`
  mutation AssignCompanyToSubcategory($companyId: Int!, $subcategoryId: Int!) {
    assignCompanyToSubcategory(
      companyId: $companyId
      subcategoryId: $subcategoryId
    ) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

const REMOVE_COMPANY_FROM_SEGMENTATION_MUTATION = gql`
  mutation RemoveCompanyFromSegmentation($companyId: Int!) {
    removeCompanyFromSegmentation(companyId: $companyId) {
      id
      name
      categoryId
      subcategoryId
      category {
        id
        name
        segments {
          id
          name
          color
        }
      }
      subcategory {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`

// Queries para obter dados de segmentação
const GET_SEGMENTATION_DATA_FOR_PLACE_QUERY = gql`
  query GetSegmentationDataForPlace($placeId: Int!) {
    segmentsByPlace(placeId: $placeId) {
      id
      name
      slug
      color
      description
      order
      isActive
    }
    categoriesByPlace(placeId: $placeId) {
      id
      name
      slug
      color
      description
      order
      isActive
      segments {
        id
        name
        color
      }
    }
    subcategoriesByPlace(placeId: $placeId) {
      id
      name
      slug
      description
      order
      isActive
      category {
        id
        name
        color
        segments {
          id
          name
          color
        }
      }
    }
  }
`

const GET_COMPANIES_WITHOUT_SEGMENTATION_QUERY = gql`
  query GetCompaniesWithoutSegmentation($placeId: Int) {
    companiesWithoutSegmentation(placeId: $placeId) {
      id
      name
      slug
      description
      placeId
      place {
        id
        name
        city
        state
      }
      isActive
    }
  }
`

export interface SegmentationData {
  segments: Array<{
    id: string
    name: string
    slug: string
    color?: string
    description: string
    order: number
    isActive: boolean
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
    color?: string
    description: string
    order: number
    isActive: boolean
    segments: Array<{
      id: string
      name: string
      color?: string
    }>
  }>
  subcategories: Array<{
    id: string
    name: string
    slug: string
    description: string
    order: number
    isActive: boolean
    category: {
      id: string
      name: string
      color?: string
      segments: Array<{
        id: string
        name: string
        color?: string
      }>
    }
  }>
}

export class CompanySegmentationService {
  /**
   * Atrelar empresa a um segmento
   * Permitido: SUPER_ADMIN, PLACE_ADMIN
   */
  async assignCompanyToSegment(
    companyId: number,
    segmentId: number,
  ): Promise<Company> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ASSIGN_COMPANY_TO_SEGMENT_MUTATION,
        variables: { companyId, segmentId },
        refetchQueries: ['GetCompanies', 'GetCompaniesByPlace'],
      })

      return data.assignCompanyToSegment as Company
    } catch (error) {
      console.error('Assign company to segment error:', error)
      throw error
    }
  }

  /**
   * Atrelar empresa a uma categoria
   * Permitido: SUPER_ADMIN, PLACE_ADMIN, COMPANY_ADMIN (própria empresa)
   */
  async assignCompanyToCategory(
    companyId: number,
    categoryId: number,
  ): Promise<Company> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ASSIGN_COMPANY_TO_CATEGORY_MUTATION,
        variables: { companyId, categoryId },
        refetchQueries: ['GetCompanies', 'GetCompaniesByPlace'],
      })

      return data.assignCompanyToCategory as Company
    } catch (error) {
      console.error('Assign company to category error:', error)
      throw error
    }
  }

  /**
   * Atrelar empresa a uma subcategoria
   * Permitido: SUPER_ADMIN, PLACE_ADMIN, COMPANY_ADMIN (própria empresa)
   */
  async assignCompanyToSubcategory(
    companyId: number,
    subcategoryId: number,
  ): Promise<Company> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ASSIGN_COMPANY_TO_SUBCATEGORY_MUTATION,
        variables: { companyId, subcategoryId },
        refetchQueries: ['GetCompanies', 'GetCompaniesByPlace'],
      })

      return data.assignCompanyToSubcategory as Company
    } catch (error) {
      console.error('Assign company to subcategory error:', error)
      throw error
    }
  }

  /**
   * Remover empresa da segmentação
   * Permitido: SUPER_ADMIN, PLACE_ADMIN, COMPANY_ADMIN (própria empresa)
   */
  async removeCompanyFromSegmentation(companyId: number): Promise<Company> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REMOVE_COMPANY_FROM_SEGMENTATION_MUTATION,
        variables: { companyId },
        refetchQueries: ['GetCompanies', 'GetCompaniesByPlace'],
      })

      return data.removeCompanyFromSegmentation as Company
    } catch (error) {
      console.error('Remove company from segmentation error:', error)
      throw error
    }
  }

  /**
   * Obter dados de segmentação para um place
   */
  async getSegmentationDataForPlace(
    placeId: number,
  ): Promise<SegmentationData> {
    try {
      const { data } = await apolloClient.query({
        query: GET_SEGMENTATION_DATA_FOR_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return {
        segments: data.segmentsByPlace || [],
        categories: data.categoriesByPlace || [],
        subcategories: data.subcategoriesByPlace || [],
      }
    } catch (error) {
      console.error('Get segmentation data error:', error)
      throw error
    }
  }

  /**
   * Obter empresas sem segmentação
   */
  async getCompaniesWithoutSegmentation(
    placeId?: number,
  ): Promise<Array<Company>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANIES_WITHOUT_SEGMENTATION_QUERY,
        variables: placeId ? { placeId } : {},
        fetchPolicy: 'cache-first',
      })

      return data.companiesWithoutSegmentation as Array<Company>
    } catch (error) {
      console.error('Get companies without segmentation error:', error)
      throw error
    }
  }

  /**
   * Validar permissões para atrelar empresa a segmento
   */
  canManageCompanySegment(
    userRoles: Array<string>,
    userPlaceId?: number,
    companyPlaceId?: number,
  ): boolean {
    // Super Admin pode gerenciar qualquer empresa
    if (userRoles.includes('SUPER_ADMIN')) {
      return true
    }

    // Place Admin pode gerenciar empresas do seu place
    if (userRoles.includes('PLACE_ADMIN') && userPlaceId === companyPlaceId) {
      return true
    }

    return false
  }

  /**
   * Validar permissões para atrelar empresa a categoria/subcategoria
   */
  canManageCompanyCategory(
    userRoles: Array<string>,
    userPlaceId?: number,
    userCompanyId?: number,
    companyPlaceId?: number,
    companyId?: number,
  ): boolean {
    // Super Admin pode gerenciar qualquer empresa
    if (userRoles.includes('SUPER_ADMIN')) {
      return true
    }

    // Place Admin pode gerenciar empresas do seu place
    if (userRoles.includes('PLACE_ADMIN') && userPlaceId === companyPlaceId) {
      return true
    }

    // Company Admin pode gerenciar apenas sua própria empresa
    if (userRoles.includes('COMPANY_ADMIN') && userCompanyId === companyId) {
      return true
    }

    return false
  }

  /**
   * Obter hierarquia de segmentação para uma empresa
   */
  getCompanySegmentationHierarchy(company: Company): {
    segment?: { id: string; name: string; color?: string }
    category?: { id: string; name: string; color?: string }
    subcategory?: { id: string; name: string }
    hasFullHierarchy: boolean
  } {
    const result = {
      segment: undefined as any,
      category: undefined as any,
      subcategory: undefined as any,
      hasFullHierarchy: false,
    }

    if (company.subcategory) {
      result.subcategory = {
        id: company.subcategory.id,
        name: company.subcategory.name,
      }

      result.category = {
        id: company.subcategory.category.id,
        name: company.subcategory.category.name,
        color: company.subcategory.category.color,
      }

      // Verificar se a categoria tem segmentos
      const segments = (company.subcategory.category as any).segments
      if (segments && segments.length > 0) {
        result.segment = {
          id: segments[0].id,
          name: segments[0].name,
          color: segments[0].color,
        }
      }
    } else if (company.category) {
      result.category = {
        id: company.category.id,
        name: company.category.name,
        color: company.category.color,
      }

      // Verificar se a categoria tem segmentos
      const segments = (company.category as any).segments
      if (segments && segments.length > 0) {
        result.segment = {
          id: segments[0].id,
          name: segments[0].name,
          color: segments[0].color,
        }
      }
    }

    // Verificar se tem hierarquia completa
    result.hasFullHierarchy = !!(
      result.segment &&
      result.category &&
      result.subcategory
    )

    return result
  }

  /**
   * Formatar dados de segmentação para exibição
   */
  formatSegmentationForDisplay(segmentationData: SegmentationData) {
    return {
      segments: segmentationData.segments.map((segment) => ({
        value: segment.id,
        label: segment.name,
        description: segment.description,
        color: segment.color || '#6B7280',
        isActive: segment.isActive,
      })),
      categories: segmentationData.categories.map((category) => ({
        value: category.id,
        label: category.name,
        description: category.description,
        color: category.color || '#22C55E',
        isActive: category.isActive,
        segments: category.segments.map((segment) => ({
          id: segment.id,
          name: segment.name,
          color: segment.color || '#6B7280',
        })),
      })),
      subcategories: segmentationData.subcategories.map((subcategory) => ({
        value: subcategory.id,
        label: subcategory.name,
        description: subcategory.description,
        isActive: subcategory.isActive,
        categoryId: subcategory.category.id,
        categoryName: subcategory.category.name,
        categoryColor: subcategory.category.color || '#22C55E',
      })),
    }
  }
}
