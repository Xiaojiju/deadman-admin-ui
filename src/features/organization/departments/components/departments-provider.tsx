import { createContext, useContext, useState, type ReactNode } from 'react'
import { type DepartmentTreeVO } from '@/types/api'
import useDialogState from '@/hooks/use-dialog-state'

type DepartmentsDialogType = 'create' | 'createChild' | 'edit' | 'delete'

type DepartmentsContextType = {
  open: DepartmentsDialogType | null
  setOpen: (type: DepartmentsDialogType | null) => void
  currentRow: DepartmentTreeVO | null
  setCurrentRow: (row: DepartmentTreeVO | null) => void
  defaultParentId: string | null
  setDefaultParentId: (id: string | null) => void
}

const DepartmentsContext = createContext<DepartmentsContextType | null>(null)

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<DepartmentsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DepartmentTreeVO | null>(null)
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null)

  return (
    <DepartmentsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        defaultParentId,
        setDefaultParentId,
      }}
    >
      {children}
    </DepartmentsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDepartments() {
  const context = useContext(DepartmentsContext)
  if (!context) {
    throw new Error('useDepartments must be used within DepartmentsProvider')
  }
  return context
}
