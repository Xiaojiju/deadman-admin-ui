import {
  type CreateUserRequest,
  type PageVO,
  type UpdateUserRequest,
  type UserAdminDetailVO,
  type UserAdminPageQuery,
  type UserAdminSummaryVO,
  type AssignUserRolesRequest,
  type AssignUserDataScopeRequest,
  type DataScopeVO,
  type ResetUserPasswordRequest,
} from '@/types/api'
import { get, post, put, del } from '@/lib/http/request'

export const usersApi = {
  page(params: UserAdminPageQuery) {
    return get<PageVO<UserAdminSummaryVO>>('/api/users', { params })
  },

  getById(userId: string) {
    return get<UserAdminDetailVO>(`/api/users/${userId}`)
  },

  create(body: CreateUserRequest) {
    return post<UserAdminDetailVO>('/api/users', body)
  },

  update(userId: string, body: UpdateUserRequest) {
    return put<UserAdminDetailVO>(`/api/users/${userId}`, body)
  },

  remove(userId: string) {
    return del<void>(`/api/users/${userId}`)
  },

  assignRoles(userId: string, body: AssignUserRolesRequest) {
    return put<UserAdminDetailVO>(`/api/users/${userId}/roles`, body)
  },

  resetPassword(userId: string, body: ResetUserPasswordRequest) {
    return put<void>(`/api/users/${userId}/password`, body)
  },

  getDataScope(userId: string) {
    return get<DataScopeVO>(`/api/users/${userId}/data-scope`)
  },

  assignDataScope(userId: string, body: AssignUserDataScopeRequest) {
    return put<DataScopeVO>(`/api/users/${userId}/data-scope`, body)
  },
}
