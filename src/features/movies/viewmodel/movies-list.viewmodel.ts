import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteMovieUseCase,
  getGenresUseCase,
  getMoviesUseCase,
} from '../usecases'
import { QUERY_KEYS } from './movie-form.viewmodel'
import type { MovieFilters } from '../model/movie.model'

export function useMoviesListViewModel() {
  const [filters, setFilters] = useState<MovieFilters>({})
  const [orderBy, setOrderBy] = useState<{
    field: string
    direction: 'ASC' | 'DESC'
  }>({
    field: 'CREATED_AT',
    direction: 'DESC',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [cursorMap, setCursorMap] = useState<Record<number, string>>({})
  const pageSize = 10
  const queryClient = useQueryClient()

  // Construir a chave da query com base nos filtros e paginação
  const getQueryKey = useCallback(
    (page: number = currentPage) => {
      const after = page > 1 ? cursorMap[page - 1] : undefined
      return [
        QUERY_KEYS.MOVIES,
        {
          filters,
          orderBy,
          pagination: {
            pageSize,
            after,
          },
        },
      ]
    },
    [filters, orderBy, currentPage, cursorMap, pageSize],
  )

  // Buscar filmes com React Query
  const {
    data: movies,
    isLoading: loadingMovies,
    refetch: refetchMovies,
  } = useQuery({
    queryKey: getQueryKey(),
    queryFn: () =>
      getMoviesUseCase.execute(filters, {
        pageSize,
        after: currentPage > 1 ? cursorMap[currentPage - 1] : undefined,
        orderBy,
      }),
    staleTime: 60 * 1000, // 1 minuto
  })

  // Buscar gêneros com React Query
  const { data: genres = [], isLoading: loadingGenres } = useQuery({
    queryKey: [QUERY_KEYS.GENRES],
    queryFn: () => getGenresUseCase.execute(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutation para excluir filme
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMovieUseCase.execute(id),
    onSuccess: () => {
      // Invalidar queries relacionadas a filmes quando um filme for excluído
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MOVIES] })
    },
  })

  // Atualizar o mapa de cursores quando os dados dos filmes forem carregados
  useEffect(() => {
    if (movies && movies.edges.length > 0 && movies.pageInfo.hasNextPage) {
      setCursorMap((prev) => ({
        ...prev,
        [currentPage]:
          movies.pageInfo.endCursor ||
          movies.edges[movies.edges.length - 1].cursor,
      }))
    }
  }, [movies, currentPage])

  const handleFilterChange = (newFilters: MovieFilters) => {
    setFilters(newFilters)
    setCursorMap({}) // Resetar cursores quando mudam os filtros
    setCurrentPage(1) // Voltar para a primeira página
  }

  const handleOrderChange = (newOrderBy: {
    field: string
    direction: 'ASC' | 'DESC'
  }) => {
    setOrderBy(newOrderBy)
    setCursorMap({}) // Resetar cursores quando muda a ordenação
    setCurrentPage(1) // Voltar para a primeira página
  }

  const handlePageChange = (page: number) => {
    if (page < 1) return

    if (
      page > 1 &&
      !cursorMap[page - 1] &&
      page > Object.keys(cursorMap).length + 1
    ) {
      // Por enquanto, simplesmente voltar para a página 1 se tentarmos pular muitas páginas
      setCurrentPage(1)
      return
    }

    setCurrentPage(page)
  }

  const calculateTotalPages = (): number => {
    if (!movies) return 1
    return Math.ceil(movies.totalCount / pageSize)
  }

  const deleteMovie = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Filme excluído com sucesso!')
      return true
    } catch (error) {
      console.error('Error deleting movie:', error)
      toast.error('Erro ao excluir filme')
      return false
    }
  }

  const initialize = useCallback(() => {
    // A inicialização já é feita automaticamente pelo React Query
    // Esta função é mantida para compatibilidade com o código existente
  }, [])

  return {
    movies,
    genres,
    loading: loadingMovies || loadingGenres || deleteMutation.isPending,
    filters,
    orderBy,
    currentPage,
    totalPages: calculateTotalPages(),
    pageSize,
    initialize,
    handleFilterChange,
    handleOrderChange,
    handlePageChange,
    deleteMovie,
    refetch: refetchMovies,
  }
}
