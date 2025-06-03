import React, { useEffect, useState } from 'react'
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiFile,
  FiFlag,
  FiGlobe,
  FiInfo,
  FiTag,
  FiType,
  FiVideo,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { GenreSelect } from './genre-select'

import { Modal } from '@/components/ui/modal'
import { useUpdateMovieViewModel } from '@/features/movies/viewmodel/movie-form.viewmodel'
import { ImageUpload } from '@/features/movies/components/image-upload'
import { MovieStatus } from '@/features/movies/model/movie.model'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'

interface EditMovieModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  movieId: string
}

export const EditMovieModal: React.FC<EditMovieModalProps> = ({
  open,
  onClose,
  onSuccess,
  movieId,
}) => {
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    reset,
    movie,
    genres,
    loading,
    isSubmitting,
    onSubmit: formSubmit,
    fetchData,
  } = useUpdateMovieViewModel(movieId)

  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    if (open && movieId) {
      fetchData()
    }
  }, [open, movieId, fetchData])

  // Resetar form quando fechar o modal
  useEffect(() => {
    if (!open) {
      reset()
      setActiveTab('basic')
    }
  }, [open, reset])

  const onSubmit = async (data: any) => {
    try {
      const success = await formSubmit(data)
      if (success && onSuccess) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      const errorFields = Object.keys(errors)
        .map((key) => {
          const fieldError = errors[key as keyof typeof errors]
          return fieldError?.message ? `${key}: ${fieldError.message}` : null
        })
        .filter(Boolean)

      if (errorFields.length > 0) {
        toast.error(
          <div>
            <p>Por favor, corrija os seguintes campos:</p>
            <ul className="mt-2 list-disc pl-4">
              {errorFields.map((errorField, index) => (
                <li key={index}>{errorField}</li>
              ))}
            </ul>
          </div>,
        )
      } else {
        toast.error(
          'Erro ao editar filme. Verifique todos os campos e tente novamente.',
        )
      }
    }
  }

  const handleGenresChange = (selectedIds: Array<string>) => {
    setValue('genreIds', selectedIds, { shouldValidate: true })
  }

  // Footer com botões de ação
  const modalFooter = (
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button
        variant="primary"
        form="edit-movie-form"
        className="flex items-center gap-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  )

  // Conteúdo das abas
  const tabContent = {
    basic: (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da esquerda: Imagem do Poster */}
          <div>
            <ImageUpload
              imageUrl={watch('imageUrl')}
              imageKey={watch('imageKey')}
              onImageChange={(url, key) => {
                setValue('imageUrl', url)
                setValue('imageKey', key)
              }}
              label="Imagem de Capa"
              folder="posters"
              aspectRatio="poster"
            />
            {errors.imageUrl && (
              <p className="text-destructive text-sm mt-1">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          {/* Coluna da direita: Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Título do filme"
                icon={<FiType />}
                {...register('title')}
                value={watch('title') || ''}
                showClearButton
                onClear={() => setValue('title', '')}
              />
              {errors.title && (
                <p className="text-destructive text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="originalTitle"
                className="block text-sm font-medium mb-1"
              >
                Título Original
              </label>
              <Input
                id="originalTitle"
                type="text"
                placeholder="Título original (se diferente)"
                icon={<FiType />}
                {...register('originalTitle')}
                value={watch('originalTitle') || ''}
                showClearButton
                onClear={() => setValue('originalTitle', '')}
              />
              {errors.originalTitle && (
                <p className="text-destructive text-sm mt-1">
                  {errors.originalTitle.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="tagline"
                className="block text-sm font-medium mb-1"
              >
                Frase de Efeito
              </label>
              <Input
                id="tagline"
                type="text"
                placeholder="Frase de efeito do filme (ex: 'Todo herói tem um começo')"
                icon={<FiTag />}
                {...register('tagline')}
                value={watch('tagline') || ''}
                showClearButton
                onClear={() => setValue('tagline', '')}
              />
              {errors.tagline && (
                <p className="text-destructive text-sm mt-1">
                  {errors.tagline.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
              >
                Descrição
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full p-2 border rounded-md bg-background h-24"
                placeholder="Descrição do filme"
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-md font-medium mb-3">Imagem de Fundo</h4>
          <ImageUpload
            imageUrl={watch('backdropUrl')}
            imageKey={watch('backdropKey')}
            onImageChange={(url, key) => {
              setValue('backdropUrl', url)
              setValue('backdropKey', key)
            }}
            label="Banner/Backdrop (formato paisagem)"
            folder="backdrops"
            aspectRatio="backdrop"
          />
          {errors.backdropUrl && (
            <p className="text-destructive text-sm mt-1">
              {errors.backdropUrl.message}
            </p>
          )}
        </div>

        <div className="mt-8">
          <GenreSelect
            genres={genres}
            selectedGenres={watch('genreIds') || []}
            onChange={handleGenresChange}
            error={errors.genreIds?.message}
          />
        </div>
      </div>
    ),

    details: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Detalhes</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Situação
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Selecione a situação</option>
              <option value={MovieStatus.RELEASED}>Lançado</option>
              <option value={MovieStatus.IN_PRODUCTION}>Em Produção</option>
            </select>
            {errors.status && (
              <p className="text-destructive text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="language"
              className="block text-sm font-medium mb-1"
            >
              Idioma
            </label>
            <Input
              id="language"
              type="text"
              placeholder="Idioma principal do filme"
              icon={<FiGlobe />}
              {...register('language')}
              value={watch('language') || ''}
              showClearButton
              onClear={() => setValue('language', '')}
            />
            {errors.language && (
              <p className="text-destructive text-sm mt-1">
                {errors.language.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="releaseDate"
              className="block text-sm font-medium mb-1"
            >
              Data de Lançamento
            </label>
            <Input
              id="releaseDate"
              type="date"
              icon={<FiCalendar />}
              {...register('releaseDate')}
              value={watch('releaseDate') || ''}
            />
            {errors.releaseDate && (
              <p className="text-destructive text-sm mt-1">
                {errors.releaseDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="duration"
              className="block text-sm font-medium mb-1"
            >
              Duração (minutos)
            </label>
            <Input
              id="duration"
              type="number"
              placeholder="Duração em minutos"
              icon={<FiClock />}
              min="1"
              {...register('duration')}
              value={
                watch('duration') !== undefined &&
                !isNaN(Number(watch('duration')))
                  ? watch('duration')
                  : ''
              }
              showClearButton
              onClear={() => setValue('duration', undefined)}
            />
            {errors.duration && (
              <p className="text-destructive text-sm mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label
              htmlFor="trailerUrl"
              className="block text-sm font-medium mb-1"
            >
              URL do Trailer
            </label>
            <Input
              id="trailerUrl"
              type="url"
              placeholder="URL do trailer no YouTube"
              icon={<FiVideo />}
              {...register('trailerUrl')}
              value={watch('trailerUrl') || ''}
              showClearButton
              onClear={() => setValue('trailerUrl', '')}
            />
            {errors.trailerUrl && (
              <p className="text-destructive text-sm mt-1">
                {errors.trailerUrl.message}
              </p>
            )}
          </div>
        </div>
      </div>
    ),

    financial: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Informações Financeiras</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="budget" className="block text-sm font-medium mb-1">
              Orçamento (USD)
            </label>
            <Input
              id="budget"
              type="number"
              placeholder="Orçamento em dólares"
              icon={<FiDollarSign />}
              min="0"
              step="0.01"
              {...register('budget')}
              value={
                watch('budget') !== undefined && !isNaN(Number(watch('budget')))
                  ? watch('budget')
                  : ''
              }
              showClearButton
              onClear={() => setValue('budget', undefined)}
            />
            {errors.budget && (
              <p className="text-destructive text-sm mt-1">
                {errors.budget.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="revenue" className="block text-sm font-medium mb-1">
              Receita (USD)
            </label>
            <Input
              id="revenue"
              type="number"
              placeholder="Receita em dólares"
              icon={<FiDollarSign />}
              min="0"
              step="0.01"
              {...register('revenue')}
              value={
                watch('revenue') !== undefined &&
                !isNaN(Number(watch('revenue')))
                  ? watch('revenue')
                  : ''
              }
              showClearButton
              onClear={() => setValue('revenue', undefined)}
            />
            {errors.revenue && (
              <p className="text-destructive text-sm mt-1">
                {errors.revenue.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="popularity"
              className="block text-sm font-medium mb-1"
            >
              Popularidade
            </label>
            <Input
              id="popularity"
              type="number"
              placeholder="Nível de popularidade"
              icon={<FiFile />}
              min="0"
              {...register('popularity')}
              value={
                watch('popularity') !== undefined &&
                !isNaN(Number(watch('popularity')))
                  ? watch('popularity')
                  : ''
              }
              showClearButton
              onClear={() => setValue('popularity', undefined)}
            />
            {errors.popularity && (
              <p className="text-destructive text-sm mt-1">
                {errors.popularity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="voteCount"
              className="block text-sm font-medium mb-1"
            >
              Contagem de Votos
            </label>
            <Input
              id="voteCount"
              type="number"
              placeholder="Número total de votos"
              icon={<FiFile />}
              min="0"
              {...register('voteCount')}
              value={
                watch('voteCount') !== undefined &&
                !isNaN(Number(watch('voteCount')))
                  ? watch('voteCount')
                  : ''
              }
              showClearButton
              onClear={() => setValue('voteCount', undefined)}
            />
            {errors.voteCount && (
              <p className="text-destructive text-sm mt-1">
                {errors.voteCount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="rating" className="block text-sm font-medium mb-1">
              Nota (0-10)
            </label>
            <Input
              id="rating"
              type="number"
              placeholder="Avaliação de 0 a 10"
              icon={<FiFlag />}
              min="0"
              max="10"
              step="0.1"
              {...register('rating')}
              value={
                watch('rating') !== undefined && !isNaN(Number(watch('rating')))
                  ? watch('rating')
                  : ''
              }
              showClearButton
              onClear={() => setValue('rating', undefined)}
            />
            {errors.rating && (
              <p className="text-destructive text-sm mt-1">
                {errors.rating.message}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
  }

  return (
    <Modal
      title="Editar Filme"
      open={open}
      onClose={onClose}
      footer={modalFooter}
      maxWidth="2xl"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          <p className="ml-3">Carregando...</p>
        </div>
      ) : !movie ? (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground mb-4">
            Filme não encontrado ou você não tem permissão para editá-lo.
          </p>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      ) : (
        <div>
          {/* Navegação por abas */}
          <div className="border-b mb-6">
            <div className="flex flex-wrap -mb-px overflow-x-auto no-scrollbar">
              <button
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'basic'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
                onClick={() => setActiveTab('basic')}
                type="button"
              >
                <FiBookOpen className="mr-2 h-4 w-4" />
                Informações Básicas
              </button>
              <button
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
                onClick={() => setActiveTab('details')}
                type="button"
              >
                <FiInfo className="mr-2 h-4 w-4" />
                Detalhes
              </button>
              <button
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  activeTab === 'financial'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
                onClick={() => setActiveTab('financial')}
                type="button"
              >
                <FiDollarSign className="mr-2 h-4 w-4" />
                Financeiro
              </button>
            </div>
          </div>

          <form id="edit-movie-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Conteúdo da aba ativa */}
            {tabContent[activeTab as keyof typeof tabContent]}

            {/* Navegação entre abas */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'details', 'financial']
                    const currentIndex = tabs.indexOf(activeTab)
                    setActiveTab(tabs[currentIndex - 1])
                  }}
                >
                  Anterior
                </Button>
              )}

              {activeTab !== 'financial' && (
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => {
                    const tabs = ['basic', 'details', 'financial']
                    const currentIndex = tabs.indexOf(activeTab)
                    setActiveTab(tabs[currentIndex + 1])
                  }}
                >
                  Próximo
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </Modal>
  )
}
