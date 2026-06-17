const BIND_TOKEN_KEY = 'wechat_bind_token'
const BIND_EXPIRES_AT_KEY = 'wechat_bind_expires_at'

export function setWechatBindToken(token: string, expiresInSec: number): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(BIND_TOKEN_KEY, token)
  sessionStorage.setItem(
    BIND_EXPIRES_AT_KEY,
    String(Date.now() + expiresInSec * 1000)
  )
}

export function getWechatBindToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null

  const token = sessionStorage.getItem(BIND_TOKEN_KEY)
  const expiresAt = sessionStorage.getItem(BIND_EXPIRES_AT_KEY)
  if (!token || !expiresAt || Date.now() > Number(expiresAt)) {
    clearWechatBindToken()
    return null
  }
  return token
}

export function clearWechatBindToken(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(BIND_TOKEN_KEY)
  sessionStorage.removeItem(BIND_EXPIRES_AT_KEY)
}
