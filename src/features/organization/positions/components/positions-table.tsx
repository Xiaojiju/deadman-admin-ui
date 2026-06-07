import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { departmentsApi } from '@/api/departments'
import { positionsApi } from '@/api/positions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { usePositionsColumns } from './positions-columns'

type DepartmentFilter = 'all' | 'global' | string

export function PositionsTable() {
  const { t } = useTranslation(['position', 'common'])
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all')

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', 'list'],
    queryFn: () => departmentsApi.list(),
  })

  const departmentNameById = useMemo(
    () => new Map(departments.map((d) => [d.id, d.deptName])),
    [departments]
  )

  const columns = usePositionsColumns(departmentNameById)

  const listQuery = useMemo(() => {
    if (departmentFilter === 'all' || departmentFilter === 'global') {
      return undefined
    }
    return { departmentId: departmentFilter }
  }, [departmentFilter])

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ['positions', listQuery?.departmentId ?? 'all'],
    queryFn: () => positionsApi.list(listQuery),
  })

  const data = useMemo(() => {
    if (departmentFilter !== 'global') return rawData
    return rawData.filter((item) => item.departmentId === null)
  }, [rawData, departmentFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Select
          value={departmentFilter}
          onValueChange={(value) => setDepartmentFilter(value)}
        >
          <SelectTrigger className='w-[220px]'>
            <SelectValue placeholder={t('position:departmentFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('position:departmentAll')}</SelectItem>
            <SelectItem value='global'>{t('position:departmentGlobal')}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.deptName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DataTableToolbar
          table={table}
          searchKey='positionName'
          searchPlaceholder={t('position:filter')}
        />
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
            {isLoading ? (
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
                  {t('position:noPositions')}
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
