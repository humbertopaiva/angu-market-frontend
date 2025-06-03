import React from 'react'

interface MovieTrailerProps {
  trailerUrl: string
}

export const MovieTrailer: React.FC<MovieTrailerProps> = ({ trailerUrl }) => {
  // Função para extrair o ID do vídeo do YouTube da URL
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  const youtubeVideoId = getYoutubeVideoId(trailerUrl)

  if (!youtubeVideoId) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20">
        <p className="text-white/60">URL do trailer inválida</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-0 pb-[56.25%]">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
        title="Trailer do filme"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}
