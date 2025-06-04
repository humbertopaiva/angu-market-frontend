// src/features/admin/services/companies-service.ts
import {
  CREATE_COMPANY_MUTATION,
  DELETE_COMPANY_MUTATION,
  GET_COMPANIES_BY_PLACE_QUERY,
  GET_COMPANIES_QUERY,
  GET_COMPANY_BY_ID_QUERY,
  UPDATE_COMPANY_MUTATION,
} from './companies-queries'
import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput,
} from '@/types/graphql'
import { apolloClient } from '@/infra/graphql/apollo-client'

export type { CreateCompanyInput, UpdateCompanyInput }

export class CompaniesService {
  async createCompany(input: CreateCompanyInput): Promise<Company> {
    try {
      // Limpar campos undefined/null/empty e valores zero para coordenadas
      const cleanInput = Object.fromEntries(
        Object.entries(input).filter(([key, value]) => {
          // Remover valores undefined, null ou strings vazias
          if (value === undefined || value === null || value === '') {
            return false
          }

          // Remover latitude/longitude se forem zero (considerados inválidos)
          if ((key === 'latitude' || key === 'longitude') && value === 0) {
            return false
          }

          return true
        }),
      )

      console.log('Creating company with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: CREATE_COMPANY_MUTATION,
        variables: { createCompanyInput: cleanInput },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })

      return data.createCompany as Company
    } catch (error) {
      console.error('Create company error:', error)
      //   // Log detalhado do erro para debugging
      //   if (error?.graphQLErrors?.length > 0) {
      //     console.error('GraphQL errors:', error.graphQLErrors)
      //   }
      //   if (error?.networkError) {
      //     console.error('Network error:', error.networkError)
      //   }
      throw error
    }
  }

  async updateCompany(input: UpdateCompanyInput): Promise<Company> {
    try {
      // Limpar campos undefined/null/empty e valores zero para coordenadas
      const cleanInput = Object.fromEntries(
        Object.entries(input).filter(([key, value]) => {
          // Sempre manter o ID
          if (key === 'id') return true

          // Remover valores undefined, null ou strings vazias
          if (value === undefined || value === null || value === '') {
            return false
          }

          // Remover latitude/longitude se forem zero (considerados inválidos)
          if ((key === 'latitude' || key === 'longitude') && value === 0) {
            return false
          }

          return true
        }),
      )

      console.log('Updating company with cleaned input:', cleanInput)

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_COMPANY_MUTATION,
        variables: { updateCompanyInput: cleanInput },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })

      return data.updateCompany as Company
    } catch (error) {
      console.error('Update company error:', error)
      // Log detalhado do erro para debugging
      //   if (error?.graphQLErrors?.length > 0) {
      //     console.error('GraphQL errors:', error.graphQLErrors)
      //   }
      //   if (error?.networkError) {
      //     console.error('Network error:', error.networkError)
      //   }
      throw error
    }
  }

  async deleteCompany(id: number): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: DELETE_COMPANY_MUTATION,
        variables: { id },
        refetchQueries: [{ query: GET_COMPANIES_QUERY }],
      })
    } catch (error) {
      console.error('Delete company error:', error)
      throw error
    }
  }

  async getCompanies(): Promise<Array<Company>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANIES_QUERY,
      })

      return data.companies.edges.map(
        (edge: any) => edge.node,
      ) as Array<Company>
    } catch (error) {
      console.error('Get companies error:', error)
      throw error
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANY_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      return data.company as Company
    } catch (error) {
      console.error('Get company by id error:', error)
      throw error
    }
  }

  async getCompaniesByPlace(placeId: number): Promise<Array<Company>> {
    try {
      const { data } = await apolloClient.query({
        query: GET_COMPANIES_BY_PLACE_QUERY,
        variables: { placeId },
        fetchPolicy: 'cache-first',
      })

      return data.companiesByPlace as Array<Company>
    } catch (error) {
      console.error('Get companies by place error:', error)
      throw error
    }
  }
}
