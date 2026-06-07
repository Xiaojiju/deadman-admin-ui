import { createContext, useContext, useState, type ReactNode } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type PositionVO } from '@/types/api'

type PositionsDialogType = 'create' | 'edit' | 'delete'

type PositionsContextType = {
  open: PositionsDialogType | null
  setOpen: (type: PositionsDialogType | null) => void
  currentRow: PositionVO | null
  setCurrentRow: (row: PositionVO | null) => void
}

const PositionsContext = createContext<PositionsContextType | null>(null)

export function PositionsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useDialogState<PositionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PositionVO | null>(null)

  return (
    <PositionsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PositionsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePositions() {
  const context = useContext(PositionsContext)
  if (!context) {
    throw new Error('usePositions must be used within PositionsProvider')
  }
  return context
}
