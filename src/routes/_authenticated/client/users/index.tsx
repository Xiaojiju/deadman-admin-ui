import { createFileRoute } from '@tanstack/react-router'
import { ClientUsers } from '@/features/client/users'

export const Route = createFileRoute('/_authenticated/client/users/')({
  component: ClientUsers,
})
