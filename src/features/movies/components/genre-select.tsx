import React, { useState } from 'react'
import { Check, Plus, Search, X } from 'lucide-react'
import type { Genre } from '../model/movie.model'
import { cn } from '@/lib/utils'

interface GenreSelectProps {
  genres: Array<Genre>
  selectedGenres: Array<string>
  onChange: (selectedIds: Array<string>) => void
  error?: string
}

export const GenreSelect: React.FC<GenreSelectProps> = ({
  genres,
  selectedGenres,
  onChange,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar gêneros com base no termo de busca
  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Encontrar objetos de gênero completos com base nos IDs selecionados
  const selectedGenreObjects = genres.filter((genre) =>
    selectedGenres.includes(genre.id),
  )

  // Remover um gênero da seleção
  const removeGenre = (genreId: string) => {
    onChange(selectedGenres.filter((id) => id !== genreId))
  }

  // Adicionar um gênero à seleção
  const addGenre = (genreId: string) => {
    if (!selectedGenres.includes(genreId)) {
      onChange([...selectedGenres, genreId])
    }
  }

  // Verificar se um gênero está selecionado
  const isSelected = (genreId: string) => selectedGenres.includes(genreId)

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">Gêneros</label>

      {/* Área de tags selecionadas */}
      <div className="min-h-[42px] p-2 border rounded-md bg-background flex flex-wrap gap-2 mb-2">
        {selectedGenreObjects.length === 0 && (
          <div className="text-muted-foreground text-sm flex items-center">
            Selecione os gêneros
          </div>
        )}

        {selectedGenreObjects.map((genre) => (
          <div
            key={genre.id}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-sm"
          >
            <span>{genre.name}</span>
            <button
              type="button"
              onClick={() => removeGenre(genre.id)}
              className="text-foreground/70 hover:text-foreground rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Campo de pesquisa */}
      <div className="relative">
        <div className="flex items-center border rounded-md bg-background">
          <Search size={16} className="ml-2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar gêneros..."
            className="w-full p-2 bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>

        {/* Lista de gêneros (sempre visível) */}
        <div className="w-full mt-1 max-h-60 overflow-auto border rounded-md bg-card shadow-md">
          {filteredGenres.length === 0 ? (
            <div className="p-3 text-center text-muted-foreground">
              Nenhum gênero encontrado
            </div>
          ) : (
            <ul>
              {filteredGenres.map((genre) => {
                const selected = isSelected(genre.id)
                return (
                  <li
                    key={genre.id}
                    className={cn(
                      'flex items-center justify-between p-3 cursor-pointer hover:bg-accent',
                      selected && 'bg-primary/10',
                    )}
                    onClick={() => {
                      if (selected) {
                        removeGenre(genre.id)
                      } else {
                        addGenre(genre.id)
                      }
                    }}
                  >
                    <span>{genre.name}</span>
                    {selected ? (
                      <Check size={16} className="text-primary" />
                    ) : (
                      <Plus size={16} className="text-muted-foreground" />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm mt-1">{error}</p>}

      <p className="text-xs text-muted-foreground mt-1">
        Clique nos gêneros para adicionar ou remover
      </p>
    </div>
  )
}
