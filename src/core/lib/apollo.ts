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

const httpLink = createHttpLink({
  uri: API_URL,
})

// Link para tratamento de erros
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      )

      if (message === 'Unauthorized' || message.includes('UNAUTHENTICATED')) {
        console.error('Token de autenticação inválido ou ausente!')

        if (!isDevelopment) {
          window.location.href = '/login'
        }
      }
    })
  if (networkError) console.error(`[Network error]: ${networkError}`)
})

// Link para adicionar o token de autenticação nos cabeçalhos
const authLink = setContext((_, { headers }) => {
  // Pegar o token de autenticação do localStorage
  const token = localStorage.getItem('auth_token')

  // Retornar os headers com o token se ele existir
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Opções de cache otimizadas para produção
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        movies: {
          // Mesclar paginação em vez de substituir
          keyArgs: ['filters'],
          merge(
            existing = { edges: [], pageInfo: {}, totalCount: 0 },
            incoming,
          ) {
            if (!existing) return incoming

            // Para recarregar completamente quando os filtros mudam
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
      fetchPolicy: import.meta.env.DEV ? 'network-only' : 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: import.meta.env.DEV ? 'network-only' : 'cache-first',
      errorPolicy: 'all',
    },
  },
})
