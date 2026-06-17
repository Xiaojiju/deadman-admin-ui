import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { clientUsersApi } from '@/api/client-users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTablePage } from '@/components/data-table'
import { useClientUsersColumns } from './client-users-columns'

export function ClientUsersTable() {
  const { t } = useTranslation(['client', 'common'])
  const columns = useClientUsersColumns()
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchKeyword(keyword.trim())
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [keyword])

  const status = statusFilter === 'all' ? undefined : Number(statusFilter)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'client-users',
      pagination.pageIndex,
      pagination.pageSize,
      searchKeyword,
      status,
    ],
    queryFn: () =>
      clientUsersApi.page({
        current: pagination.pageIndex + 1,
        size: pagination.pageSize,
        keyword: searchKeyword || undefined,
        status,
      }),
  })

  const pageCount = data ? Math.ceil(data.total / data.size) : 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.records ?? [],
    columns,
    pageCount,
    state: { pagination, columnVisibility },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <DataTablePage
      table={table}
      isLoading={isLoading}
      isFetching={isFetching}
      onRefresh={() => void refetch()}
      emptyMessage={t('client:users.noUsers')}
      filters={
        <>
          <Input
            placeholder={t('client:users.filter')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className='h-8 w-full sm:max-w-xs'
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className='h-8 w-35'>
              <SelectValue placeholder={t('client:users.statusFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('client:users.statusAll')}</SelectItem>
              <SelectItem value='1'>
                {t('client:users.columns.active')}
              </SelectItem>
              <SelectItem value='0'>
                {t('client:users.columns.inactive')}
              </SelectItem>
            </SelectContent>
          </Select>
          {(searchKeyword || statusFilter !== 'all') && (
            <Button
              variant='ghost'
              className='h-8'
              onClick={() => {
                setKeyword('')
                setSearchKeyword('')
                setStatusFilter('all')
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              {t('common:reset')}
            </Button>
          )}
        </>
      }
    />
  )
}
