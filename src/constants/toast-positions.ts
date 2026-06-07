import type { ToasterProps } from 'sonner'

export type ToastPosition = NonNullable<ToasterProps['position']>

export const TOAST_POSITIONS = [
  {
    id: 'top-left' as const,
    labelKey: 'notifications.positions.topLeft',
  },
  {
    id: 'top-center' as const,
    labelKey: 'notifications.positions.topCenter',
  },
  {
    id: 'top-right' as const,
    labelKey: 'notifications.positions.topRight',
  },
  {
    id: 'bottom-left' as const,
    labelKey: 'notifications.positions.bottomLeft',
  },
  {
    id: 'bottom-center' as const,
    labelKey: 'notifications.positions.bottomCenter',
  },
  {
    id: 'bottom-right' as const,
    labelKey: 'notifications.positions.bottomRight',
  },
] as const

export type ToastPositionId = (typeof TOAST_POSITIONS)[number]['id']

export const DEFAULT_TOAST_POSITION: ToastPositionId = 'bottom-right'

export const TOAST_POSITION_STORAGE_KEY = 'deadman_toast_position'

export function isToastPositionId(value: string): value is ToastPositionId {
  return TOAST_POSITIONS.some((item) => item.id === value)
}
