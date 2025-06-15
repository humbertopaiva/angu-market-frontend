// src/core/lib/apollo.ts

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

// URL do nosso backend GraphQL
const isDevelopment = import.meta.env.DEV
const API_URL = isDevelopment
  ? import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql'
  : 'https://cb-back.limei.app/graphql'

console.log('Apollo Client - API URL:', API_URL)
console.log('Apollo Client - Environment:', isDevelopment ? 'development' : 'production')

const httpLink = createHttpLink({
  uri: API_URL,
})

// Link para tratamento de erros
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      )
      console.error('Operation:', operation.operationName)
      console.error('Variables:', operation.variables)

      if (message === 'Unauthorized' || message.includes('UNAUTHENTICATED')) {
        console.error('Token de autenticação inválido ou ausente!')

        if (!isDevelopment) {
          window.location.href = '/login'
        }
      }
    })
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    console.error('Network error details:', networkError)
    
  
  }
})

// Link para adicionar o token de autenticação nos cabeçalhos
const authLink = setContext((_, { headers }) => {
  // Pegar o token de autenticação do localStorage
  const token = localStorage.getItem('auth_token')

  console.log('Auth link - Token exists:', !!token)
  console.log('Auth link - Token preview:', token ? `${token.substring(0, 20)}...` : 'none')

  // Retornar os headers com o token se ele existir
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  }
})

// Cache otimizado
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // CORREÇÃO: Cache para empresas
        companies: {
          merge(existing = [], incoming) {
            console.log('Cache merge - companies:', { existing: existing.length, incoming: incoming.length })
            return incoming // Sempre usar os dados mais recentes
          },
        },
        companiesByPlace: {
          keyArgs: ['placeId'],
          merge(existing = [], incoming) {
            console.log('Cache merge - companiesByPlace:', { existing: existing.length, incoming: incoming.length })
            return incoming
          },
        },
        // Cache para outras consultas
        movies: {
          keyArgs: ['filters'],
          merge(
            existing = { edges: [], pageInfo: {}, totalCount: 0 },
            incoming,
          ) {
            if (!existing) return incoming

            if (incoming.pageInfo.startCursor === incoming.pageInfo.endCursor) {
              return incoming
            }

            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            }
          },
        },
      },
    },
  },
})

// Criar o cliente Apollo com os links configurados
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Usar cache mas também buscar no servidor
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first', // Preferir cache para consultas simples
      errorPolicy: 'all',
    },
    mutate: {
      fetchPolicy: 'no-cache', // Mutations sempre no servidor
      errorPolicy: 'all',
    },
  },
})

console.log('Apollo Client initialized successfully')