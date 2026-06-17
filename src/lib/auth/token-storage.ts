import { getCookie, removeCookie } from '@/lib/cookies'

export const ACCESS_TOKEN_KEY = 'admin_access_token'
export const ACCESS_EXPIRE_AT_KEY = 'admin_access_expire_at'
const LEGACY_COOKIE_KEY = 'deadman_access_token'

export function getAccessToken(): string {
  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY)
    if (stored) return stored
  }

  const legacy = getCookie(LEGACY_COOKIE_KEY)
  if (legacy) {
    try {
      const token = JSON.parse(legacy) as unknown
      if (typeof token === 'string' && token) {
        setAccessToken(token)
        removeCookie(LEGACY_COOKIE_KEY)
        return token
      }
    } catch {
      // ignore malformed legacy cookie
    }
  }

  return ''
}

export function setAccessToken(token: string, expiresInSec?: number): void {
  if (typeof sessionStorage === 'undefined') return

  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  if (expiresInSec != null) {
    sessionStorage.setItem(
      ACCESS_EXPIRE_AT_KEY,
      String(Date.now() + expiresInSec * 1000)
    )
  }
}

export function clearAccessToken(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(ACCESS_EXPIRE_AT_KEY)
  }
  removeCookie(LEGACY_COOKIE_KEY)
}
