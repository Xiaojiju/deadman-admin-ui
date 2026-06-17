import axios from 'axios'
import { getAccessToken } from '@/lib/auth/token-storage'
import { setupAuthInterceptor } from './auth-interceptor'
import { resolveApiBaseURL } from './resolve-base-url'

export const httpClient = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let the browser set multipart boundary; default application/json breaks file uploads.
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

setupAuthInterceptor()
