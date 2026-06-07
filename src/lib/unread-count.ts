export function normalizeUnreadCount(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return Math.floor(parsed)
}

export function incrementUnreadCount(current: unknown): number {
  return normalizeUnreadCount(current) + 1
}
