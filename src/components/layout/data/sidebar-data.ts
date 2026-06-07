import { type TFunction } from 'i18next'
import {
  Bell,
  Building2,
  Briefcase,
  Inbox,
  KeyRound,
  Palette,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Users,
  Wrench,
  Command,
} from 'lucide-react'
import { DEADMAN_COMPONENT_CODES } from '@/constants/components'
import { type AuthUser } from '@/stores/auth-store'
import { PERMISSIONS, type PermissionInput } from '@/constants/permissions'
import { formatUnreadBadge } from '@/lib/format-unread-badge'
import { resolveFileAccessUrl } from '@/lib/files/resolve-file-url'
import { type NavGroup, type SidebarData } from '../types'

export type NavItemConfig = {
  titleKey: string
  url?: string
  icon?: React.ElementType
  badge?: string
  permission?: PermissionInput
  /** 依赖的服务端组件编码；未设置则视为内置默认路由，始终展示 */
  componentCode?: string
  items?: (NavItemConfig & { url: string })[]
}

export type NavGroupConfig = {
  titleKey: string
  items: NavItemConfig[]
}

function getSidebarBrand(t: TFunction) {
  return {
    name: t('layout:teams.shadcnAdmin'),
    logo: Command,
    plan: t('layout:teams.vitePlan'),
  }
}

export function getSidebarNavConfig(): NavGroupConfig[] {
  return [
    {
      titleKey: 'layout:sidebar.general',
      items: [
        {
          titleKey: 'layout:sidebar.inbox',
          url: '/notifications/inbox',
          icon: Inbox,
          permission: PERMISSIONS.NOTIFICATION_INBOX_READ,
        },
      ],
    },
    {
      titleKey: 'layout:sidebar.client',
      items: [
        {
          titleKey: 'layout:sidebar.clientUsers',
          url: '/client/users',
          icon: Smartphone,
          permission: PERMISSIONS.CLIENT_USER_LIST_READ,
          componentCode: DEADMAN_COMPONENT_CODES.CLIENT,
        },
      ],
    },
    {
      titleKey: 'layout:sidebar.organization',
      items: [
        {
          titleKey: 'layout:sidebar.departments',
          url: '/organization/departments',
          icon: Building2,
          permission: PERMISSIONS.DEPT_LIST_READ,
        },
        {
          titleKey: 'layout:sidebar.positions',
          url: '/organization/positions',
          icon: Briefcase,
          permission: PERMISSIONS.POSITION_LIST_READ,
        },
      ],
    },
    {
      titleKey: 'layout:sidebar.system',
      items: [
        {
          titleKey: 'layout:sidebar.users',
          url: '/system/users',
          icon: Users,
          permission: PERMISSIONS.USER_LIST_READ,
        },
        {
          titleKey: 'layout:sidebar.roles',
          url: '/system/roles',
          icon: Shield,
          permission: PERMISSIONS.ROLE_LIST_READ,
        },
        {
          titleKey: 'layout:sidebar.permissions',
          url: '/system/permissions',
          icon: ShieldCheck,
          permission: PERMISSIONS.ROLE_LIST_READ,
        },
      ],
    },
    {
      titleKey: 'layout:sidebar.other',
      items: [
        {
          titleKey: 'layout:sidebar.settings',
          icon: Settings,
          items: [
            {
              titleKey: 'layout:sidebar.account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              titleKey: 'layout:sidebar.password',
              url: '/settings/password',
              icon: KeyRound,
              permission: PERMISSIONS.AUTH_PASSWORD_CHANGE,
            },
            {
              titleKey: 'layout:sidebar.appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              titleKey: 'layout:sidebar.notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
          ],
        },
      ],
    },
  ]
}

function filterNavItemsByComponent(
  items: NavItemConfig[],
  installedCodes: ReadonlySet<string>
): NavItemConfig[] {
  return items.reduce<NavItemConfig[]>((acc, item) => {
    if (item.componentCode && !installedCodes.has(item.componentCode)) {
      return acc
    }

    if (item.items) {
      const visibleSubItems = item.items.filter(
        (sub) => !sub.componentCode || installedCodes.has(sub.componentCode)
      )
      if (visibleSubItems.length === 0) return acc
      acc.push({ ...item, items: visibleSubItems })
      return acc
    }

    acc.push(item)
    return acc
  }, [])
}

function mapNavItems(
  items: NavItemConfig[],
  t: TFunction
): SidebarData['navGroups'][number]['items'] {
  return items
    .map((item) => {
      if (item.items) {
        return {
          title: t(item.titleKey),
          icon: item.icon,
          permission: item.permission,
          items: item.items.map(
            ({ titleKey, url, icon, badge, permission }) => ({
              title: t(titleKey),
              url,
              icon,
              badge,
              permission,
            })
          ),
        }
      }

      if (!item.url) return null

      return {
        title: t(item.titleKey),
        url: item.url,
        icon: item.icon,
        badge: item.badge,
        permission: item.permission,
      }
    })
    .filter(Boolean) as SidebarData['navGroups'][number]['items']
}

export function buildSidebarData(options: {
  user: AuthUser | null
  t: TFunction
  inboxUnreadCount?: number
  installedComponentCodes?: string[]
}): SidebarData {
  const {
    user,
    t,
    inboxUnreadCount = 0,
    installedComponentCodes = [],
  } = options
  const fallbackName = user?.nickname || t('common:user')
  const fallbackCode = user?.userCode || t('common:unknown')
  const inboxBadge = formatUnreadBadge(inboxUnreadCount)
  const installedCodes = new Set(installedComponentCodes)

  const navGroups: NavGroup[] = getSidebarNavConfig()
    .map((group) => ({
      title: t(group.titleKey),
      items: mapNavItems(
        filterNavItemsByComponent(group.items, installedCodes),
        t
      ),
    }))
    .filter((group) => group.items.length > 0)
    .map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.url === '/notifications/inbox' && inboxBadge) {
          return { ...item, badge: inboxBadge }
        }
        return item
      }),
    }))

  return {
    user: {
      name: fallbackName,
      email: fallbackCode,
      avatar:
        resolveFileAccessUrl(user?.avatar) || '/avatars/shadcn.jpg',
    },
    brand: getSidebarBrand(t),
    navGroups,
  }
}
