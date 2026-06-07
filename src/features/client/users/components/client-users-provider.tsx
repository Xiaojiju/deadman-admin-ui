import { createContext, useContext, useState, type ReactNode } from 'react'
import { type ClientUserAdminSummaryVO } from '@/types/api'
import useDialogState from '@/hooks/use-dialog-state'

type ClientUsersDialogType = 'detail' | 'disable' | 'delete'

type ClientUsersContextType = {
  open: ClientUsersDialogType | null
  setOpen: (type: ClientUsersDialogType | null) => void
  currentRow: ClientUserAdminSummaryVO | null
  setCurrentRow: (row: ClientUserAdminSummaryVO | null) => void
}

const ClientUsersContext = createContext<ClientUsersContextType | null>(null)

export function ClientUsersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<ClientUsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ClientUserAdminSummaryVO | null>(
    null
  )

  return (
    <ClientUsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ClientUsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClientUsers() {
  const context = useContext(ClientUsersContext)
  if (!context) {
    throw new Error('useClientUsers must be used within ClientUsersProvider')
  }
  return context
}
