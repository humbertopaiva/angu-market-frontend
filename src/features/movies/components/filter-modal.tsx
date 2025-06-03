import React, { useEffect, useState } from 'react'
import { FiCalendar, FiClock, FiFilter, FiGlobe, FiX } from 'react-icons/fi'
import { MovieStatus } from '../model/movie.model'
import { GenreSelect } from './genre-select'
import type { Genre, MovieFilters } from '../model/movie.model'
import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'

interface FilterModalProps {
  genres: Array<Genre>
  currentFilters: MovieFilters
  onApplyFilters: (filters: MovieFilters) => void
}

export const FilterModal: React.FC<FilterModalProps> = ({
  genres,
  currentFilters,
  onApplyFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<MovieFilters>(currentFilters)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const numericTypes = ['number', 'range']

    if (name === 'status') {
      setFilters((prev) => ({
        ...prev,
        status: value ? (value as MovieStatus) : undefined,
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: numericTypes.includes(type) && value ? Number(value) : value,
      }))
    }
  }

  // Novo método para lidar com a mudança de gêneros selecionados
  const handleGenresChange = (selectedIds: Array<string>) => {
    setFilters((prev) => ({ ...prev, genreIds: selectedIds }))
  }

  const handleApply = () => {
    onApplyFilters(filters)
    handleClose()
  }

  const handleClear = () => {
    const emptyFilters: MovieFilters = {}
    setFilters(emptyFilters)
    onApplyFilters(emptyFilters)
    handleClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleOpen}
        className="flex items-center gap-2"
      >
        Filtros
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filtros</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium mb-1"
                >
                  Pesquisar
                </label>
                <Input
                  id="search"
                  name="search"
                  type="text"
                  value={filters.search || ''}
                  onChange={handleChange}
                  placeholder="Título, título original ou descrição"
                  icon={<FiFilter />}
                  showClearButton={!!filters.search}
                  onClear={() =>
                    setFilters((prev) => ({ ...prev, search: '' }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium mb-1"
                >
                  Situação
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status || ''}
                  onChange={handleChange}
                  className="w-full p-3 border bg-background/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Todas as situações</option>
                  <option value={MovieStatus.RELEASED}>Lançado</option>
                  <option value={MovieStatus.IN_PRODUCTION}>Em Produção</option>
                </select>
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
                  name="language"
                  type="text"
                  value={filters.language || ''}
                  onChange={handleChange}
                  placeholder="Filtrar por idioma"
                  icon={<FiGlobe />}
                  showClearButton={!!filters.language}
                  onClear={() =>
                    setFilters((prev) => ({ ...prev, language: '' }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="minDuration"
                    className="block text-sm font-medium mb-1"
                  >
                    Duração Mínima (min)
                  </label>
                  <Input
                    id="minDuration"
                    name="minDuration"
                    type="number"
                    min="0"
                    value={filters.minDuration || ''}
                    onChange={handleChange}
                    icon={<FiClock />}
                    showClearButton={!!filters.minDuration}
                    onClear={() =>
                      setFilters((prev) => ({
                        ...prev,
                        minDuration: undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="maxDuration"
                    className="block text-sm font-medium mb-1"
                  >
                    Duração Máxima (min)
                  </label>
                  <Input
                    id="maxDuration"
                    name="maxDuration"
                    type="number"
                    min="0"
                    value={filters.maxDuration || ''}
                    onChange={handleChange}
                    icon={<FiClock />}
                    showClearButton={!!filters.maxDuration}
                    onClear={() =>
                      setFilters((prev) => ({
                        ...prev,
                        maxDuration: undefined,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="releaseDateFrom"
                    className="block text-sm font-medium mb-1"
                  >
                    Data de Lançamento (De)
                  </label>
                  <Input
                    id="releaseDateFrom"
                    name="releaseDateFrom"
                    type="date"
                    value={filters.releaseDateFrom || ''}
                    onChange={handleChange}
                    icon={<FiCalendar />}
                    showClearButton={!!filters.releaseDateFrom}
                    onClear={() =>
                      setFilters((prev) => ({
                        ...prev,
                        releaseDateFrom: undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="releaseDateTo"
                    className="block text-sm font-medium mb-1"
                  >
                    Data de Lançamento (Até)
                  </label>
                  <Input
                    id="releaseDateTo"
                    name="releaseDateTo"
                    type="date"
                    value={filters.releaseDateTo || ''}
                    onChange={handleChange}
                    icon={<FiCalendar />}
                    showClearButton={!!filters.releaseDateTo}
                    onClear={() =>
                      setFilters((prev) => ({
                        ...prev,
                        releaseDateTo: undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Substituindo o select múltiplo pelo GenreSelect */}
              <div>
                <GenreSelect
                  genres={genres}
                  selectedGenres={filters.genreIds || []}
                  onChange={handleGenresChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClear}>
                  Limpar
                </Button>
                <Button variant="primary" onClick={handleApply}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
