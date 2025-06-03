import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { tokenStorage } from '@/infra/storage/token-storage'

// HTTP link para o GraphQL endpoint
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
})

// Auth link para adicionar o token nas requisições
const authLink = setContext((_, { headers }) => {
  const token = tokenStorage.getToken()

  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  }
})

// Error link para tratar erros globais
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        )
      })
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`)

      // Se for erro 401 (não autorizado), limpar token e redirecionar para login
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        tokenStorage.removeToken()
        window.location.href = '/auth/login'
      }
    }
  },
)

// Apollo Client configurado
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})
