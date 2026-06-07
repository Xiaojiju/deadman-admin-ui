import { type AxiosRequestConfig } from 'axios'
import { type ApiResult } from '@/types/api'
import { ApiError } from './api-error'
import { httpClient } from './client'

async function unwrap<T>(
  promise: Promise<{ data: ApiResult<T> }>
): Promise<T> {
  const { data } = await promise
  if (data.code !== 0) {
    throw new ApiError(data.msg || 'Request failed', data.code)
  }
  return data.data
}

export function get<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap<T>(httpClient.get(url, config))
}

export function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) {
  return unwrap<T>(httpClient.post(url, body, config))
}

export function postForm<T>(url: string, formData: FormData, config?: AxiosRequestConfig) {
  return unwrap<T>(httpClient.post(url, formData, config))
}

export function put<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
) {
  return unwrap<T>(httpClient.put(url, body, config))
}

export function del<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap<T>(httpClient.delete(url, config))
}
