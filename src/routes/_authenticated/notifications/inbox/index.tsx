import { createFileRoute } from '@tanstack/react-router'
import { NotificationInbox } from '@/features/notifications'

export const Route = createFileRoute('/_authenticated/notifications/inbox/')({
  component: NotificationInbox,
})
