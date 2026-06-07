import { get, post, put } from '@/lib/http/request'
import {
  type AuthTokenVO,
  type ChangePasswordRequest,
  type LoginRequest,
  type UserAuthorityVO,
} from '@/types/api'

export const authApi = {
  login(body: LoginRequest) {
    return post<AuthTokenVO>('/api/auth/login', body)
  },

  getPermissions() {
    return get<UserAuthorityVO>('/api/auth/permissions')
  },

  changePassword(body: ChangePasswordRequest) {
    return put<void>('/api/auth/password', body)
  },
}
