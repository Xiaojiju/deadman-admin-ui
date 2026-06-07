import { normalizeUnreadCount } from '@/lib/unread-count'

export function formatUnreadBadge(count: unknown): string | undefined {
  const normalized = normalizeUnreadCount(count)
  if (normalized <= 0) return undefined
  return normalized > 99 ? '99+' : String(normalized)
}
