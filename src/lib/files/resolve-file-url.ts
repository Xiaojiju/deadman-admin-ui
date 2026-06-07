import { resolveApiBaseURL } from '@/lib/http/resolve-base-url'

/** Resolve file accessUrl (relative `/files/...` or absolute) for img/src usage. */
export function resolveFileAccessUrl(
  url: string | null | undefined
): string | undefined {
  const trimmed = url?.trim()
  if (!trimmed) return undefined

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  if (trimmed.startsWith('/')) {
    const base = resolveApiBaseURL()
    if (base && !base.startsWith('/')) {
      return `${base.replace(/\/+$/, '')}${trimmed}`
    }
    return trimmed
  }

  return trimmed
}
