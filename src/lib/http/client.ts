import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { resolveApiBaseURL } from './resolve-base-url'

export const httpClient = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let the browser set multipart boundary; default application/json breaks file uploads.
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      useAuthStore.getState().auth.reset()
    }
    return Promise.reject(error)
  }
)
