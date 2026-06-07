import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/system/users'

export const Route = createFileRoute('/_authenticated/system/users/')({
  component: Users,
})
