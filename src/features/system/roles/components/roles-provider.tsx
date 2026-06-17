import { createContext, useContext, useState, type ReactNode } from 'react'
import { type RoleSummaryVO } from '@/types/api'
import useDialogState from '@/hooks/use-dialog-state'

type RolesDialogType = 'create' | 'edit' | 'delete' | 'permissions'

type RolesContextType = {
  open: RolesDialogType | null
  setOpen: (type: RolesDialogType | null) => void
  currentRow: RoleSummaryVO | null
  setCurrentRow: (row: RoleSummaryVO | null) => void
}

const RolesContext = createContext<RolesContextType | null>(null)

export function RolesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<RolesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RoleSummaryVO | null>(null)

  return (
    <RolesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RolesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoles() {
  const context = useContext(RolesContext)
  if (!context) {
    throw new Error('useRoles must be used within RolesProvider')
  }
  return context
}
