import { createFileRoute } from '@tanstack/react-router'
import { Positions } from '@/features/organization/positions'

export const Route = createFileRoute('/_authenticated/organization/positions/')(
  {
    component: Positions,
  }
)
