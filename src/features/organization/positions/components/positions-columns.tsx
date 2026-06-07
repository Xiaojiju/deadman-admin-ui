import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { type PositionVO } from '@/types/api'
import { usePermission } from '@/hooks/use-permission'
import { PermissionGate } from '@/components/permission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { usePositions } from './positions-provider'

export function usePositionsColumns(
  departmentNameById: Map<string, string>
): ColumnDef<PositionVO>[] {
  const { t } = useTranslation('position')

  return useMemo(
    () => [
      {
        accessorKey: 'positionCode',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('columns.positionCode')}
          />
        ),
        cell: ({ row }) => (
          <span className='font-mono text-sm'>{row.getValue('positionCode')}</span>
        ),
      },
      {
        accessorKey: 'positionName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('columns.positionName')}
          />
        ),
      },
      {
        accessorKey: 'departmentId',
        header: t('columns.department'),
        cell: ({ row }) => {
          const departmentId = row.getValue<string | null>('departmentId')
          if (!departmentId) {
            return (
              <Badge variant='outline'>{t('globalDepartment')}</Badge>
            )
          }
          return departmentNameById.get(departmentId) ?? departmentId
        },
      },
      {
        accessorKey: 'sortOrder',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('columns.sortOrder')}
          />
        ),
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => {
          const status = row.getValue<number>('status')
          return (
            <Badge variant={status === 1 ? 'default' : 'secondary'}>
              {status === 1 ? t('columns.active') : t('columns.inactive')}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <PositionRowActions row={row.original} />,
      },
    ],
    [t, departmentNameById]
  )
}

function PositionRowActions({ row }: { row: PositionVO }) {
  const { t } = useTranslation('position')
  const { setOpen, setCurrentRow } = usePositions()
  const { can } = usePermission()

  const hasAnyAction =
    can(PERMISSIONS.POSITION_UPDATE) || can(PERMISSIONS.POSITION_DELETE)

  if (!hasAnyAction) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <PermissionGate permission={PERMISSIONS.POSITION_UPDATE}>
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
        <PermissionGate permission={PERMISSIONS.POSITION_DELETE}>
          <>
            <DropdownMenuSeparator />
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
          </>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
