import { get, post } from '@/lib/http/request'
import { normalizeUnreadCount } from '@/lib/unread-count'
import {
  type NotificationInboxPageQuery,
  type NotificationInboxVO,
  type NotificationSendResultVO,
  type NotificationSentPageQuery,
  type NotificationSentVO,
  type PageVO,
  type SendNotificationRequest,
} from '@/types/api'

export const notificationsApi = {
  pageInbox(params: NotificationInboxPageQuery) {
    return get<PageVO<NotificationInboxVO>>('/api/notifications/inbox', {
      params,
    })
  },

  unreadCount() {
    return get<number>('/api/notifications/inbox/unread-count').then(
      normalizeUnreadCount
    )
  },

  markRead(recipientId: string) {
    return post<void>(`/api/notifications/inbox/${recipientId}/read`)
  },

  markAllRead() {
    return post<void>('/api/notifications/inbox/read-all')
  },

  send(body: SendNotificationRequest) {
    return post<NotificationSendResultVO>('/api/notifications/send', body)
  },

  pageSent(params: NotificationSentPageQuery) {
    return get<PageVO<NotificationSentVO>>('/api/notifications/sent', {
      params,
    })
  },
}
