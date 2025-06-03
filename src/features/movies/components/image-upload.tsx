import React, { useCallback, useState } from 'react'
import { FiUpload, FiX } from 'react-icons/fi'

import { s3UploadService } from '../services/s3-upload.service'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  imageUrl: string | undefined
  imageKey?: string | undefined
  onImageChange: (url: string, key?: string) => void
  label: string
  movieTitle?: string
  folder?: string
  aspectRatio?: 'poster' | 'backdrop' // Novo prop para controlar a proporção
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  imageKey,
  onImageChange,
  label,
  folder = 'images',
  aspectRatio = 'poster', // Default para poster (vertical)
  className,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = useCallback(
    async (file: File) => {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)

      try {
        setUploadProgress(10)

        // Upload do arquivo para o S3
        const { url, key } = await s3UploadService.uploadFile(file, folder)

        setUploadProgress(100)
        // Agora passamos a URL e a chave para permitir exclusão posterior
        onImageChange(url, key)
      } catch (error) {
        console.error('Error uploading image:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Erro desconhecido durante o upload.',
        )
      } finally {
        setIsUploading(false)
      }
    },
    [folder, onImageChange],
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        uploadImage(file)
      }
    },
    [uploadImage],
  )

  const handleUrlInput = useCallback(() => {
    const url = prompt('Digite a URL da imagem:')
    if (url && url.trim() !== '') {
      onImageChange(url.trim())
    }
  }, [onImageChange])

  const handleRemoveImage = useCallback(async () => {
    // Se temos a chave do arquivo, tentamos excluí-lo do S3
    if (imageKey) {
      await s3UploadService.deleteFile(imageKey)
    }

    // Limpamos a imagem independentemente do resultado da exclusão
    onImageChange('', undefined)
  }, [onImageChange, imageKey])

  // Classes para controlar a proporção
  const aspectClasses = {
    poster: 'aspect-[2/3]', // Proporção vertical para pôsteres (2:3)
    backdrop: 'aspect-[16/9]', // Proporção horizontal para backdrops (16:9)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium mb-1">{label}</label>

      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt={label}
            className={cn(
              'w-full object-cover rounded-md border',
              aspectClasses[aspectRatio],
            )}
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/80"
            title="Remover imagem"
            type="button"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed border-input rounded-md flex flex-col items-center justify-center',
            aspectClasses[aspectRatio],
          )}
        >
          <FiUpload className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4 text-center px-4">
            {aspectRatio === 'poster'
              ? 'Imagem no formato retrato (2:3)'
              : 'Imagem no formato paisagem (16:9)'}
          </p>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
              />
              <Button type="button" variant="outline" disabled={isUploading}>
                Escolher arquivo
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlInput}
              disabled={isUploading}
            >
              Usar URL
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {uploadProgress}% concluído
          </p>
        </div>
      )}

      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  )
}
