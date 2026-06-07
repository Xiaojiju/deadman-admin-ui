import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { PageLayout } from '@/components/layout/page-layout'
import { Main } from '@/components/layout/main'
import { PermissionGate } from '@/components/permission'
import { Button } from '@/components/ui/button'
import { PositionsDialogs } from './components/positions-dialogs'
import { PositionsProvider, usePositions } from './components/positions-provider'
import { PositionsTable } from './components/positions-table'

function PositionsHeaderActions() {
  const { t } = useTranslation('position')
  const { setOpen } = usePositions()

  return (
    <PermissionGate permission={PERMISSIONS.POSITION_CREATE}>
      <Button onClick={() => setOpen('create')}>
        <Plus className='me-2 h-4 w-4' />
        {t('create')}
      </Button>
    </PermissionGate>
  )
}

export function Positions() {
  const { t } = useTranslation('position')

  return (
    <PositionsProvider>
      <PageLayout>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
              <p className='text-muted-foreground'>{t('desc')}</p>
            </div>
            <PositionsHeaderActions />
          </div>
          <PositionsTable />
        </Main>

        <PositionsDialogs />
      </PageLayout>
    </PositionsProvider>
  )
}
