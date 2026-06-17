import { toast } from 'sonner'
import {
  type AppToastContext,
  type AppToastPayload,
  type InboxNotificationToastPayload,
} from '@/lib/toast/types'
import { InboxNotificationToast } from '@/components/toast/inbox-notification-toast'

const INBOX_NOTIFICATION_TOAST_DURATION_MS = 8_000
const CONTENT_PREVIEW_LENGTH = 120
const INBOX_ROUTE = '/notifications/inbox'

function previewContent(content: string): string {
  if (content.length <= CONTENT_PREVIEW_LENGTH) return content
  return `${content.slice(0, CONTENT_PREVIEW_LENGTH)}…`
}

function showInboxNotificationToast(
  payload: InboxNotificationToastPayload,
  ctx: AppToastContext
) {
  const viewLabel = ctx.viewLabel ?? 'View'
  const onNavigate =
    ctx.onNavigate ??
    ((href: string) => {
      window.location.assign(href)
    })

  toast.custom(
    (toastId) => (
      <InboxNotificationToast
        toastId={toastId}
        title={payload.title}
        description={previewContent(payload.content)}
        viewLabel={viewLabel}
        onView={() => onNavigate(INBOX_ROUTE)}
      />
    ),
    {
      id: `inbox-notification-${payload.notificationId}`,
      duration: INBOX_NOTIFICATION_TOAST_DURATION_MS,
    }
  )
}

export function showAppToast(
  payload: AppToastPayload,
  ctx: AppToastContext = {}
) {
  switch (payload.type) {
    case 'inbox-notification':
      showInboxNotificationToast(payload, ctx)
      break
  }
}
