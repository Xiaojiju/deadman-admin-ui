export type {
  InboxNotificationPayload,
  InboxWebSocketMessage,
} from '@/lib/ws/parse-inbox-ws-message'

/** @deprecated Use InboxNotificationPayload */
export type InboxWebSocketPayload =
  import('@/lib/ws/parse-inbox-ws-message').InboxNotificationPayload
