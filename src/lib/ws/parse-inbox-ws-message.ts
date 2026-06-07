export type InboxNotificationPayload = {
  notificationId: string | number
  title: string
  content: string
  createTime: string
}

export type InboxWebSocketMessage = {
  channelCode: string
  createTime: string
  messageId: string
  messageType: string
  payload: InboxNotificationPayload
  targetUserKey: string
}

function isInboxNotificationPayload(
  value: unknown
): value is InboxNotificationPayload {
  if (!value || typeof value !== 'object') return false

  const payload = value as Partial<InboxNotificationPayload>
  return (
    typeof payload.title === 'string' &&
    typeof payload.content === 'string' &&
    typeof payload.createTime === 'string' &&
    (typeof payload.notificationId === 'string' ||
      typeof payload.notificationId === 'number')
  )
}

export function parseInboxWebSocketMessage(
  data: unknown
): InboxNotificationPayload | null {
  if (!data || typeof data !== 'object') return null

  const message = data as Partial<InboxWebSocketMessage>

  if (
    message.messageType !== 'INBOX_NOTIFICATION' ||
    !isInboxNotificationPayload(message.payload)
  ) {
    return null
  }

  return message.payload
}
