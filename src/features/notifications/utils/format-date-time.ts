import { format } from 'date-fns'

export function formatNotificationDateTime(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return format(new Date(value), 'PPpp')
  } catch {
    return value
  }
}
