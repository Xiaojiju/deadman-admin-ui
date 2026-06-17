import { useState } from 'react'
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
import { rolesApi } from '@/api/system'
import { DataTablePage, DataTableToolbar } from '@/components/data-table'
import { useRolesColumns } from './roles-columns'

export function RolesTable() {
  const { t } = useTranslation(['system', 'common'])
  const columns = useRolesColumns()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })

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
      emptyMessage={t('system:roles.noRoles')}
      filters={
        <DataTableToolbar
          table={table}
          searchKey='roleName'
          searchPlaceholder={t('system:roles.filter')}
        />
      }
    />
  )
}
