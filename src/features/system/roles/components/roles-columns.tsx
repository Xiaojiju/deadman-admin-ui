import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Shield, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PERMISSIONS } from '@/constants/permissions'
import { type RoleSummaryVO } from '@/types/api'
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
import { useRoles } from './roles-provider'

export function useRolesColumns(): ColumnDef<RoleSummaryVO>[] {
  const { t } = useTranslation('system')

  return useMemo(
    () => [
      {
        accessorKey: 'roleCode',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('roles.columns.roleCode')}
          />
        ),
        cell: ({ row }) => (
          <span className='font-mono text-sm'>{row.getValue('roleCode')}</span>
        ),
      },
      {
        accessorKey: 'roleName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('roles.columns.roleName')}
          />
        ),
      },
      {
        accessorKey: 'description',
        header: t('roles.columns.description'),
        cell: ({ row }) => row.getValue('description') || '-',
      },
      {
        accessorKey: 'status',
        header: t('roles.columns.status'),
        cell: ({ row }) => {
          const status = row.getValue<number>('status')
          return (
            <Badge variant={status === 1 ? 'default' : 'secondary'}>
              {status === 1
                ? t('roles.columns.active')
                : t('roles.columns.inactive')}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'systemBuiltin',
        header: t('roles.columns.builtin'),
        cell: ({ row }) =>
          row.getValue('systemBuiltin') ? (
            <Badge variant='outline'>{t('roles.columns.system')}</Badge>
          ) : (
            '-'
          ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <RoleRowActions row={row.original} />,
      },
    ],
    [t]
  )
}

function RoleRowActions({ row }: { row: RoleSummaryVO }) {
  const { t } = useTranslation('system')
  const { setOpen, setCurrentRow } = useRoles()
  const { can } = usePermission()

  const hasAnyAction =
    can(PERMISSIONS.ROLE_PERMISSION_ASSIGN) ||
    can(PERMISSIONS.ROLE_UPDATE) ||
    (can(PERMISSIONS.ROLE_DELETE) && !row.systemBuiltin)

  if (!hasAnyAction) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <PermissionGate permission={PERMISSIONS.ROLE_PERMISSION_ASSIGN}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('permissions')
            }}
          >
            <Shield className='me-2 h-4 w-4' />
            {t('roles.actions.permissions')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.ROLE_UPDATE}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
          >
            <Pencil className='me-2 h-4 w-4' />
            {t('roles.actions.edit')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate
          permission={PERMISSIONS.ROLE_DELETE}
          when={!row.systemBuiltin}
        >
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
              {t('roles.actions.delete')}
            </DropdownMenuItem>
          </>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
