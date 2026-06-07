export type InboxNotificationToastPayload = {
  type: 'inbox-notification'
  notificationId: string | number
  title: string
  content: string
}

/** Extend with more toast payload variants as needed. */
export type AppToastPayload = InboxNotificationToastPayload

export type AppToastContext = {
  viewLabel?: string
  onNavigate?: (href: string) => void
}
