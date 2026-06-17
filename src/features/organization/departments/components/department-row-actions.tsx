import { type DepartmentTreeVO } from '@/types/api'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/use-permission'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PermissionGate } from '@/components/permission'
import { useDepartments } from './departments-provider'

export function DepartmentRowActions({ row }: { row: DepartmentTreeVO }) {
  const { t } = useTranslation('department')
  const { setOpen, setCurrentRow, setDefaultParentId } = useDepartments()
  const { can } = usePermission()

  const hasAnyAction = can([
    PERMISSIONS.DEPT_CREATE,
    PERMISSIONS.DEPT_UPDATE,
    PERMISSIONS.DEPT_DELETE,
  ])

  if (!hasAnyAction) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <PermissionGate permission={PERMISSIONS.DEPT_CREATE}>
          <DropdownMenuItem
            onClick={() => {
              setDefaultParentId(row.id)
              setCurrentRow(row)
              setOpen('createChild')
            }}
          >
            <Plus className='me-2 h-4 w-4' />
            {t('actions.addChild')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.DEPT_UPDATE}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
          >
            <Pencil className='me-2 h-4 w-4' />
            {t('actions.edit')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.DEPT_DELETE}>
          <DropdownMenuItem
            className='text-destructive'
            onClick={() => {
              setCurrentRow(row)
              setOpen('delete')
            }}
          >
            <Trash2 className='me-2 h-4 w-4' />
            {t('actions.delete')}
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
