import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination'
import { DataTableViewOptions } from './view-options'

export type DataTablePageProps<TData> = {
  table: ReactTable<TData>
  isLoading?: boolean
  isFetching?: boolean
  onRefresh?: () => void
  emptyMessage: string
  filters?: React.ReactNode
  showViewOptions?: boolean
}

export function DataTablePage<TData>({
  table,
  isLoading = false,
  isFetching = false,
  onRefresh,
  emptyMessage,
  filters,
  showViewOptions = true,
}: DataTablePageProps<TData>) {
  const { t } = useTranslation('common')
  const loading = isLoading || isFetching
  const columnCount = table.getAllColumns().length
  const rows = table.getRowModel().rows

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        {filters ? (
          <div className='flex flex-1 flex-wrap items-center gap-2'>
            {filters}
          </div>
        ) : (
          <div className='flex-1' />
        )}
        <div className='flex shrink-0 items-center gap-2'>
          {showViewOptions ? <DataTableViewOptions table={table} /> : null}
          {onRefresh ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 gap-2'
              onClick={onRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={cn('size-4', isFetching && 'animate-spin')}
              />
              {t('refresh')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className='relative overflow-hidden rounded-md border'>
        {loading ? (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[1px]'>
            <LoadingIndicator />
          </div>
        ) : null}
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
            {rows.length ? (
              rows.map((row) => (
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
                  colSpan={columnCount}
                  className='h-24 text-center text-muted-foreground'
                >
                  {loading ? (
                    <div className='flex justify-center'>
                      <LoadingIndicator />
                    </div>
                  ) : (
                    emptyMessage
                  )}
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
