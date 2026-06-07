import { createFileRoute } from '@tanstack/react-router'
import { Departments } from '@/features/organization/departments'

export const Route = createFileRoute('/_authenticated/organization/departments/')({
  component: Departments,
})
