import { createFileRoute } from '@tanstack/react-router'
import { Permissions } from '@/features/system/permissions'

export const Route = createFileRoute('/_authenticated/system/permissions/')({
  component: Permissions,
})
