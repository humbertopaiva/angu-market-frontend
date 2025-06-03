import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { RatingCircle } from './rating-circle'
import type { Movie } from '../model/movie.model'

interface MovieCardProps {
  movie: Movie
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <Link to="/movies/$id" params={{ id: movie.id }} className="block h-full">
      <div
        className="bg-card shadow-md overflow-hidden transition-transform hover:scale-[1.03] h-full cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.imageUrl || 'https://placehold.co/600x900?text=No+Image'}
            alt={movie.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay gradiente que vai de baixo (mais opaco) para cima (transparente) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent"></div>

          {/* Informações de título na parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            <h3 className="font-sans font-semibold text-base sm:text-lg text-foreground uppercase line-clamp-2">
              {movie.title}
            </h3>
            {/* Exibindo os gêneros em vez do título original */}
            <p className="text-white/70 text-xs sm:text-sm font-light line-clamp-1">
              {movie.genres.length > 0
                ? movie.genres.map((genre) => genre.name).join(', ')
                : 'Sem gêneros definidos'}
            </p>
          </div>

          {/* Rating Circle que aparece no centro apenas quando hover */}
          {isHovering && movie.rating && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RatingCircle rating={movie.rating} size={96} />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
