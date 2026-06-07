import { useTranslation } from 'react-i18next'
import { PageLayout } from '@/components/layout/page-layout'
import { Main } from '@/components/layout/main'
import { ClientUsersDialogs } from './components/client-users-dialogs'
import { ClientUsersProvider } from './components/client-users-provider'
import { ClientUsersTable } from './components/client-users-table'

export function ClientUsers() {
  const { t } = useTranslation('client')

  return (
    <ClientUsersProvider>
      <PageLayout>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('users.title')}
            </h2>
            <p className='text-muted-foreground'>{t('users.desc')}</p>
          </div>
          <ClientUsersTable />
        </Main>
        <ClientUsersDialogs />
      </PageLayout>
    </ClientUsersProvider>
  )
}
