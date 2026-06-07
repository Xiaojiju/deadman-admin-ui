import { createContext, useContext, useState, type ReactNode } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type UserAdminSummaryVO } from '@/types/api'

type UsersDialogType = 'create' | 'edit' | 'delete' | 'roles' | 'resetPassword'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (type: UsersDialogType | null) => void
  currentRow: UserAdminSummaryVO | null
  setCurrentRow: (row: UserAdminSummaryVO | null) => void
}

const UsersContext = createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<UserAdminSummaryVO | null>(null)

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const context = useContext(UsersContext)
  if (!context) {
    throw new Error('useUsers must be used within UsersProvider')
  }
  return context
}
