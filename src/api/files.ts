import { del, get, postForm } from '@/lib/http/request'
import { type FileMetadataVO } from '@/types/api'

type FileUploadOptions = {
  bizType?: string
  providerId?: string
}

export const filesApi = {
  upload(file: File, options: FileUploadOptions = {}) {
    const formData = new FormData()
    formData.append('file', file, file.name)
    if (options.bizType) formData.append('bizType', options.bizType)
    if (options.providerId) formData.append('providerId', options.providerId)
    return postForm<FileMetadataVO>('/api/files/upload', formData)
  },

  listProviders() {
    return get<string[]>('/api/files/providers')
  },

  getMetadata(fileId: string) {
    return get<FileMetadataVO>(`/api/files/${fileId}`)
  },

  remove(fileId: string) {
    return del<void>(`/api/files/${fileId}`)
  },

  downloadUrl(fileId: string) {
    const base = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
    const path = `/api/files/${fileId}/download`
    return base ? `${base.replace(/\/+$/, '')}${path}` : path
  },
}
