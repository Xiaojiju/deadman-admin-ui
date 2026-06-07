import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'
import { requireRouteComponent } from '@/lib/component-guard'
import { requireRoutePermission } from '@/lib/permission-guard'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
    requireRoutePermission(location.pathname)
    requireRouteComponent(location.pathname)
  },
  component: AuthenticatedLayout,
})
