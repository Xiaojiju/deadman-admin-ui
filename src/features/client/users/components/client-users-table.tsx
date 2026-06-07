import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { useClientUsersColumns } from './client-users-columns'

export function ClientUsersTable() {
  const { t } = useTranslation(['client', 'common'])
  const columns = useClientUsersColumns()
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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

  const { data, isLoading, isFetching } = useQuery({
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
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
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
      </div>

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {t('common:loading')}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {t('client:users.noUsers')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
