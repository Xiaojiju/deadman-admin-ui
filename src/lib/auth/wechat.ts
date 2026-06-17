import {
  type AdminWechatWebLoginResult,
  type AuthTokenVO,
  type WechatPendingBindVO,
} from '@/types/api'

export function isWechatPendingBind(
  data: AdminWechatWebLoginResult
): data is WechatPendingBindVO {
  return 'needBind' in data && data.needBind === true
}

export function isAuthToken(
  data: AdminWechatWebLoginResult
): data is AuthTokenVO {
  return 'accessToken' in data && typeof data.accessToken === 'string'
}
