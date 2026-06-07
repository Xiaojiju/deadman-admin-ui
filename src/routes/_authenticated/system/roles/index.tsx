import { createFileRoute } from '@tanstack/react-router'
import { Roles } from '@/features/system/roles'

export const Route = createFileRoute('/_authenticated/system/roles/')({
  component: Roles,
})
