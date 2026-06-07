import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { PageLayout } from '@/components/layout/page-layout'
import { Main } from '@/components/layout/main'
import { PermissionGate } from '@/components/permission'
import { Button } from '@/components/ui/button'
import { RolesDialogs } from './components/roles-dialogs'
import { RolesProvider, useRoles } from './components/roles-provider'
import { RolesTable } from './components/roles-table'

function RolesHeaderActions() {
  const { t } = useTranslation('system')
  const { setOpen } = useRoles()

  return (
    <PermissionGate permission={PERMISSIONS.ROLE_CREATE}>
      <Button onClick={() => setOpen('create')}>
        <Plus className='me-2 h-4 w-4' />
        {t('roles.create')}
      </Button>
    </PermissionGate>
  )
}

export function Roles() {
  const { t } = useTranslation('system')

  return (
    <RolesProvider>
      <PageLayout>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                {t('roles.title')}
              </h2>
              <p className='text-muted-foreground'>{t('roles.desc')}</p>
            </div>
            <RolesHeaderActions />
          </div>
          <RolesTable />
        </Main>

        <RolesDialogs />
      </PageLayout>
    </RolesProvider>
  )
}
