import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { departmentsApi } from '@/api/departments'
import { positionsApi } from '@/api/positions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTablePage, DataTableToolbar } from '@/components/data-table'
import { usePositionsColumns } from './positions-columns'

type DepartmentFilter = 'all' | 'global' | string

export function PositionsTable() {
  const { t } = useTranslation(['position', 'common'])
  const [departmentFilter, setDepartmentFilter] =
    useState<DepartmentFilter>('all')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

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

  const { data: rawData = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['positions', listQuery],
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
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataTablePage
      table={table}
      isLoading={isLoading}
      isFetching={isFetching}
      onRefresh={() => void refetch()}
      emptyMessage={t('position:noPositions')}
      filters={
        <>
          <Select
            value={departmentFilter}
            onValueChange={(value) => setDepartmentFilter(value)}
          >
            <SelectTrigger className='h-8 w-55'>
              <SelectValue placeholder={t('position:departmentFilter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('position:departmentAll')}</SelectItem>
              <SelectItem value='global'>
                {t('position:departmentGlobal')}
              </SelectItem>
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
        </>
      }
    />
  )
}
