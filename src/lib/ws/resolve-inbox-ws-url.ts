import { resolveApiBaseURL } from '@/lib/http/resolve-base-url'

/**
 * Build inbox WebSocket URL: ws(s)://host/ws/inbox?token={jwt}
 * - Uses VITE_API_BASE_URL when set (http→ws, https→wss)
 * - Otherwise same-origin (dev Vite proxy on /ws)
 */
export function resolveInboxWebSocketURL(token: string): string {
  const normalizedToken = token.trim()
  if (!normalizedToken) {
    throw new Error('WebSocket token is required')
  }

  const query = `token=${encodeURIComponent(normalizedToken)}`
  const path = `/ws/inbox?${query}`
  const base = resolveApiBaseURL()

  if (base) {
    if (/^https:\/\//i.test(base)) {
      return `${base.replace(/^https:\/\//i, 'wss://').replace(/\/+$/, '')}${path}`
    }
    if (/^http:\/\//i.test(base)) {
      return `${base.replace(/^http:\/\//i, 'ws://').replace(/\/+$/, '')}${path}`
    }
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}${path}`
}
