import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { PageLayout } from '@/components/layout/page-layout'
import { Main } from '@/components/layout/main'
import { PermissionGate } from '@/components/permission'
import { Button } from '@/components/ui/button'
import { DepartmentsDialogs } from './components/departments-dialogs'
import {
  DepartmentsProvider,
  useDepartments,
} from './components/departments-provider'
import { DepartmentsTree } from './components/departments-tree'

function DepartmentsHeaderActions() {
  const { t } = useTranslation('department')
  const { setOpen, setDefaultParentId } = useDepartments()

  return (
    <PermissionGate permission={PERMISSIONS.DEPT_CREATE}>
      <Button
        onClick={() => {
          setDefaultParentId(null)
          setOpen('create')
        }}
      >
        <Plus className='me-2 h-4 w-4' />
        {t('create')}
      </Button>
    </PermissionGate>
  )
}

export function Departments() {
  const { t } = useTranslation('department')

  return (
    <DepartmentsProvider>
      <PageLayout>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>{t('title')}</h2>
              <p className='text-muted-foreground'>{t('desc')}</p>
            </div>
            <DepartmentsHeaderActions />
          </div>
          <DepartmentsTree />
        </Main>

        <DepartmentsDialogs />
      </PageLayout>
    </DepartmentsProvider>
  )
}
