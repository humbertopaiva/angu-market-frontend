import { gql } from '@apollo/client'
import { apolloClient } from '@/core/lib/apollo'

const GET_PRESIGNED_URL = gql`
  mutation GetPresignedUploadUrl($input: PresignedUrlInput!) {
    getPresignedUploadUrl(input: $input) {
      presignedUrl
      key
      fileUrl
    }
  }
`

const DELETE_FILE = gql`
  mutation DeleteFile($key: String!) {
    deleteFile(key: $key)
  }
`

interface PresignedUrlResponse {
  getPresignedUploadUrl: {
    presignedUrl: string
    key: string
    fileUrl: string
  }
}

interface PresignedUrlInput {
  folder: string
  filename: string
  contentType?: string
}

class S3UploadService {
  async getPresignedUploadUrl(
    file: File,
    folder: string,
  ): Promise<{ presignedUrl: string; key: string; fileUrl: string }> {
    try {
      console.log(`Getting presigned URL for ${file.name} in folder ${folder}`)

      const { data } = await apolloClient.mutate<
        {
          getPresignedUploadUrl: PresignedUrlResponse['getPresignedUploadUrl']
        },
        { input: PresignedUrlInput }
      >({
        mutation: GET_PRESIGNED_URL,
        variables: {
          input: {
            folder,
            filename: file.name,
            contentType: file.type,
          },
        },
      })

      if (!data) {
        throw new Error('Failed to get presigned URL')
      }

      return {
        presignedUrl: data.getPresignedUploadUrl.presignedUrl,
        key: data.getPresignedUploadUrl.key,
        fileUrl: data.getPresignedUploadUrl.fileUrl,
      }
    } catch (error) {
      console.error('Error getting presigned URL:', error)
      throw error
    }
  }

  async uploadFileWithPresignedUrl(
    file: File,
    presignedUrl: string,
  ): Promise<void> {
    try {
      console.log(
        `Uploading file ${file.name} (${file.size} bytes) to ${presignedUrl}`,
      )

      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!response.ok) {
        const responseText = await response.text()
        console.error('Upload failed. Response:', responseText)
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`,
        )
      }

      console.log('Upload successful!')
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async uploadFile(
    file: File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    try {
      // Obter URL pré-assinada
      const { presignedUrl, key, fileUrl } = await this.getPresignedUploadUrl(
        file,
        folder,
      )

      // Fazer o upload com fetch
      await this.uploadFileWithPresignedUrl(file, presignedUrl)

      // Retornar a URL final da imagem e a chave para referência futura
      return { url: fileUrl, key }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ deleteFile: boolean }>({
        mutation: DELETE_FILE,
        variables: { key },
      })

      return data?.deleteFile || false
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }
}

export const s3UploadService = new S3UploadService()
