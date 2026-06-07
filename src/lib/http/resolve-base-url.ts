/**
 * Resolve API base URL from env.
 * - Empty: use same-origin (dev Vite proxy on /api)
 * - With protocol: use as-is
 * - host:port only: prepend http:// (common .env.local mistake)
 */
export function resolveApiBaseURL(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
  if (!raw) return ''

  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '')

  if (raw.startsWith('/')) return raw.replace(/\/+$/, '')

  return `http://${raw.replace(/\/+$/, '')}`
}
