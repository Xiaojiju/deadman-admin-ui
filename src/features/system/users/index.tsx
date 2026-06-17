import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { PageLayout } from '@/components/layout/page-layout'
import { PermissionGate } from '@/components/permission'
import { UsersDialogs } from './components/users-dialogs'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'

function UsersHeaderActions() {
  const { t } = useTranslation('system')
  const { setOpen } = useUsers()

  return (
    <PermissionGate permission={PERMISSIONS.USER_CREATE}>
      <Button onClick={() => setOpen('create')}>
        <Plus className='me-2 h-4 w-4' />
        {t('users.create')}
      </Button>
    </PermissionGate>
  )
}

export function Users() {
  const { t } = useTranslation('system')

  return (
    <UsersProvider>
      <PageLayout>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                {t('users.title')}
              </h2>
              <p className='text-muted-foreground'>{t('users.desc')}</p>
            </div>
            <UsersHeaderActions />
          </div>
          <UsersTable />
        </Main>

        <UsersDialogs />
      </PageLayout>
    </UsersProvider>
  )
}
