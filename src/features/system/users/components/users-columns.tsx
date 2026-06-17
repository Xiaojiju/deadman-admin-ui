import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { type UserAdminSummaryVO } from '@/types/api'
import {
  KeyRound,
  MoreHorizontal,
  Pencil,
  Shield,
  Database,
  Trash2,
} from 'lucide-react'
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
import { isSuperAdminUser } from '../utils'
import { useUsers } from './users-provider'

export function useUsersColumns(): ColumnDef<UserAdminSummaryVO>[] {
  const { t } = useTranslation('system')

  return useMemo(
    () => [
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('users.columns.username')}
          />
        ),
        cell: ({ row }) => {
          const user = row.original
          const initials =
            user.nickname?.slice(0, 2) || user.username.slice(0, 2)
          return (
            <div className='flex items-center gap-3'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src={resolveFileAccessUrl(user.avatar)}
                  alt={user.nickname}
                />
                <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>
                  {user.nickname || user.username}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {user.username}
                </span>
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
        id: 'department',
        header: t('users.columns.department'),
        cell: ({ row }) => row.original.department?.name ?? '-',
      },
      {
        id: 'positions',
        header: t('users.columns.positions'),
        cell: ({ row }) => {
          const positions = row.original.positions ?? []
          if (positions.length === 0) return '-'
          return (
            <div className='flex max-w-48 flex-wrap gap-1'>
              {positions.map((position) => (
                <Badge key={position.id} variant='outline' className='text-xs'>
                  {position.name}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        accessorKey: 'roleCodes',
        header: t('users.columns.roles'),
        cell: ({ row }) => {
          const codes = row.getValue<string[]>('roleCodes') ?? []
          if (codes.length === 0) return '-'
          return (
            <div className='flex flex-wrap gap-1'>
              {codes.map((code) => (
                <Badge
                  key={code}
                  variant='secondary'
                  className='font-mono text-xs'
                >
                  {code}
                </Badge>
              ))}
            </div>
          )
        },
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
        cell: ({ row }) => <UserRowActions row={row.original} />,
      },
    ],
    [t]
  )
}

function UserRowActions({ row }: { row: UserAdminSummaryVO }) {
  const { t } = useTranslation('system')
  const { setOpen, setCurrentRow } = useUsers()
  const { can } = usePermission()
  const superAdmin = isSuperAdminUser(row)

  const hasAnyAction =
    can(PERMISSIONS.ROLE_USER_ASSIGN) ||
    can(PERMISSIONS.USER_UPDATE) ||
    can(PERMISSIONS.USER_PASSWORD_RESET) ||
    (can(PERMISSIONS.USER_DELETE) && !superAdmin)

  if (!hasAnyAction) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <PermissionGate permission={PERMISSIONS.ROLE_USER_ASSIGN}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('roles')
            }}
          >
            <Shield className='me-2 h-4 w-4' />
            {t('users.actions.roles')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('dataScope')
            }}
          >
            <Database className='me-2 h-4 w-4' />
            {t('users.actions.dataScope')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('edit')
            }}
          >
            <Pencil className='me-2 h-4 w-4' />
            {t('users.actions.edit')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.USER_PASSWORD_RESET}>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row)
              setOpen('resetPassword')
            }}
          >
            <KeyRound className='me-2 h-4 w-4' />
            {t('users.actions.resetPassword')}
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission={PERMISSIONS.USER_DELETE} when={!superAdmin}>
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
