import { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { type ApiResult, type AuthTokenVO } from '@/types/api'
import { useAuthStore } from '@/stores/auth-store'
import { clearAccessToken, setAccessToken } from '@/lib/auth/token-storage'
import { httpClient } from './client'

const REFRESH_URL = '/api/auth/refresh'

const SKIP_REFRESH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/login/wechat-web',
  '/api/auth/wechat-web/bind',
]

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return true
  return SKIP_REFRESH_PATHS.some((path) => url.includes(path))
}

function flushPendingQueue(error: unknown, token?: string) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  pendingQueue = []
}

async function refreshAccessToken(): Promise<string> {
  const response = await httpClient.post<ApiResult<AuthTokenVO>>(
    REFRESH_URL,
    null
  )
  const { code, data, msg } = response.data

  if (code === 10009 || code === 10008) {
    throw new Error(msg || 'Session revoked')
  }
  if (code !== 0 || !data?.accessToken) {
    throw new Error(msg || 'Refresh failed')
  }

  setAccessToken(data.accessToken, data.expiresIn)
  useAuthStore.getState().auth.setAccessToken(data.accessToken)
  return data.accessToken
}

export function setupAuthInterceptor() {
  httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResult>) => {
      const original = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined
      const status = error.response?.status
      const bizCode = error.response?.data?.code

      if (status !== 401 || !original || original._retry) {
        return Promise.reject(error)
      }

      if (bizCode === 10009 || bizCode === 10008) {
        clearAccessToken()
        useAuthStore.getState().auth.reset()
        return Promise.reject(error)
      }

      if (shouldSkipRefresh(original.url)) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(httpClient(original))
            },
            reject,
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        flushPendingQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return httpClient(original)
      } catch (refreshError) {
        flushPendingQueue(refreshError)
        clearAccessToken()
        useAuthStore.getState().auth.reset()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
  )
}
