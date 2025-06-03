import { useNavigate } from '@tanstack/react-router'
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMovieUseCase, getMovieUseCase } from '../usecases'
import { QUERY_KEYS } from './query-keys'

export function useMovieDetailsViewModel(id: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Query para buscar detalhes do filme
  const {
    data: movie,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.MOVIE(id)],
    queryFn: () => getMovieUseCase.execute(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Mutation para excluir filme
  const deleteMutation = useMutation({
    mutationFn: (movieId: string) => deleteMovieUseCase.execute(movieId),
    onSuccess: () => {
      toast.success('Filme excluído com sucesso!')
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MOVIES] })
      navigate({ to: '/' })
    },
    onError: (error) => {
      console.error('Error deleting movie:', error)
      toast.error('Erro ao excluir filme')
    },
  })

  // Função para confirmar e excluir filme
  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este filme?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return {
    movie,
    loading: isLoading,
    isDeleting: deleteMutation.isPending,
    fetchMovie: refetch,
    handleDelete,
  }
}
