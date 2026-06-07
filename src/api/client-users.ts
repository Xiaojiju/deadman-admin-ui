import { del, get, put } from '@/lib/http/request'
import {
  type ClientUserAdminDetailVO,
  type ClientUserAdminPageQuery,
  type ClientUserAdminSummaryVO,
  type PageVO,
} from '@/types/api'

export const clientUsersApi = {
  page(params: ClientUserAdminPageQuery) {
    return get<PageVO<ClientUserAdminSummaryVO>>('/api/client-users', { params })
  },

  getById(userId: string) {
    return get<ClientUserAdminDetailVO>(`/api/client-users/${userId}`)
  },

  disable(userId: string) {
    return put<ClientUserAdminDetailVO>(`/api/client-users/${userId}/disable`)
  },

  remove(userId: string) {
    return del<void>(`/api/client-users/${userId}`)
  },
}
