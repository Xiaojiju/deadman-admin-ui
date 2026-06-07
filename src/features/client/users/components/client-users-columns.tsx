import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { type ClientUserAdminSummaryVO } from '@/types/api'
import { Ban, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { resolveFileAccessUrl } from '@/lib/files/resolve-file-url'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/use-permission'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { PermissionGate } from '@/components/permission'
import { useClientUsers } from './client-users-provider'

export function useClientUsersColumns(): ColumnDef<ClientUserAdminSummaryVO>[] {
  const { t } = useTranslation('client')

  return useMemo(
    () => [
      {
        accessorKey: 'nickname',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('users.columns.user')}
          />
        ),
        cell: ({ row }) => {
          const user = row.original
          const displayName = user.nickname || user.username || user.userCode
          const initials = displayName.slice(0, 2).toUpperCase()
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={resolveFileAccessUrl(user.avatar)}
                  alt={displayName}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>{displayName}</span>
                {user.username ? (
                  <span className='text-xs text-muted-foreground'>
                    {user.username}
                  </span>
                ) : null}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'userCode',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('users.columns.userCode')}
          />
        ),
        cell: ({ row }) => (
          <span className='font-mono text-sm'>{row.getValue('userCode')}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: t('users.columns.phone'),
        cell: ({ row }) => row.getValue<string | null>('phone') || '-',
      },
      {
        accessorKey: 'status',
        header: t('users.columns.status'),
        cell: ({ row }) => {
          const status = row.getValue<number>('status')
          return (
            <Badge variant={status === 1 ? 'default' : 'secondary'}>
              {status === 1
                ? t('users.columns.active')
                : t('users.columns.inactive')}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'createTime',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('users.columns.createTime')}
          />
        ),
        cell: ({ row }) => {
          const value = row.getValue<string>('createTime')
          return value ? new Date(value).toLocaleString() : '-'
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => <ClientUserRowActions row={row.original} />,
      },
    ],
    [t]
  )
}

function ClientUserRowActions({ row }: { row: ClientUserAdminSummaryVO }) {
  const { t } = useTranslation('client')
  const { setOpen, setCurrentRow } = useClientUsers()
  const { can } = usePermission()

  const hasAnyAction =
    can(PERMISSIONS.CLIENT_USER_LIST_READ) ||
    (can(PERMISSIONS.CLIENT_USER_UPDATE) && row.status === 1) ||
    can(PERMISSIONS.CLIENT_USER_DELETE)

  if (!hasAnyAction) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <PermissionGate permission={PERMISSIONS.CLIENT_USER_LIST_READ}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('detail')
            }}
          >
            <Eye className='me-2 h-4 w-4' />
            {t('users.actions.view')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate
          permission={PERMISSIONS.CLIENT_USER_UPDATE}
          when={row.status === 1}
        >
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('disable')
            }}
          >
            <Ban className='me-2 h-4 w-4' />
            {t('users.actions.disable')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.CLIENT_USER_DELETE}>
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
              {t('users.actions.delete')}
            </DropdownMenuItem>
          </>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
