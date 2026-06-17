import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { notificationsApi } from '@/api/notifications'
import { useAuthStore } from '@/stores/auth-store'
import { NOTIFICATION_QUERY_KEYS } from '@/constants/notification-query-keys'
import { PERMISSIONS } from '@/constants/permissions'
import { useLayout } from '@/context/layout-provider'
import { usePermission } from '@/hooks/use-permission'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { buildSidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { SidebarBrand } from './sidebar-brand'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { t } = useTranslation(['layout', 'common'])
  const user = useAuthStore((s) => s.auth.user)
  const installedComponentCodes = useAuthStore(
    (s) => s.auth.installedComponentCodes
  )
  const { can } = usePermission()
  const canInbox = can(PERMISSIONS.NOTIFICATION_INBOX_READ)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.unreadCount],
    queryFn: () => notificationsApi.unreadCount(),
    enabled: canInbox,
  })

  const sidebarData = useMemo(
    () =>
      buildSidebarData({
        user,
        t,
        inboxUnreadCount: unreadCount,
        installedComponentCodes,
      }),
    [user, t, unreadCount, installedComponentCodes]
  )

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <SidebarBrand
          name={sidebarData.brand.name}
          description={sidebarData.brand.plan}
          logo={sidebarData.brand.logo}
        />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
