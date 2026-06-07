import { Outlet } from '@tanstack/react-router'
import { Bell, Palette, Wrench, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS, type PermissionInput } from '@/constants/permissions'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { PageLayout } from '@/components/layout/page-layout'
import { SidebarNav } from './components/sidebar-nav'

const SETTINGS_NAV_ITEMS: {
  titleKey: string
  href: string
  icon: typeof Wrench
  permission?: PermissionInput
}[] = [
  {
    titleKey: 'nav.account',
    href: '/settings/account',
    icon: Wrench,
  },
  {
    titleKey: 'nav.password',
    href: '/settings/password',
    icon: KeyRound,
    permission: PERMISSIONS.AUTH_PASSWORD_CHANGE,
  },
  {
    titleKey: 'nav.appearance',
    href: '/settings/appearance',
    icon: Palette,
  },
  {
    titleKey: 'nav.notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
]

export function Settings() {
  const { t } = useTranslation('settings')

  const sidebarNavItems = SETTINGS_NAV_ITEMS.map(
    ({ titleKey, href, icon: Icon, permission }) => ({
      title: t(titleKey),
      href,
      icon: <Icon size={18} />,
      permission,
    })
  )

  return (
    <PageLayout fixed={false}>
      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground'>{t('description')}</p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </PageLayout>
  )
}
