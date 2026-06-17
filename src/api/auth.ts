import {
  type AdminWechatWebLoginResult,
  type AuthTokenVO,
  type ChangePasswordRequest,
  type LoginRequest,
  type UserAuthorityVO,
  type WechatWebBindRequest,
  type WechatWebLoginRequest,
} from '@/types/api'
import { get, post, put } from '@/lib/http/request'

export const authApi = {
  login(body: LoginRequest) {
    return post<AuthTokenVO>('/api/auth/login', body)
  },

  refresh() {
    return post<AuthTokenVO>('/api/auth/refresh')
  },

  loginWechatWeb(body: WechatWebLoginRequest) {
    return post<AdminWechatWebLoginResult>('/api/auth/login/wechat-web', body)
  },

  bindWechatWeb(body: WechatWebBindRequest) {
    return post<AuthTokenVO>('/api/auth/wechat-web/bind', body)
  },

  getPermissions() {
    return get<UserAuthorityVO>('/api/auth/permissions')
  },

  changePassword(body: ChangePasswordRequest) {
    return put<void>('/api/auth/password', body)
  },
}
