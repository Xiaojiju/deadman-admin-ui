import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  DEFAULT_TOAST_POSITION,
  TOAST_POSITION_STORAGE_KEY,
  isToastPositionId,
  type ToastPositionId,
} from '@/constants/toast-positions'

type ToastPositionProviderState = {
  position: ToastPositionId
  defaultPosition: ToastPositionId
  setPosition: (position: ToastPositionId) => void
  resetPosition: () => void
}

const ToastPositionContext = createContext<ToastPositionProviderState | null>(
  null
)

function readStoredPosition(): ToastPositionId {
  try {
    const stored = localStorage.getItem(TOAST_POSITION_STORAGE_KEY)
    if (stored && isToastPositionId(stored)) return stored
  } catch {
    // ignore
  }
  return DEFAULT_TOAST_POSITION
}

export function ToastPositionProvider({ children }: { children: ReactNode }) {
  const [position, setPositionState] =
    useState<ToastPositionId>(readStoredPosition)

  const setPosition = (next: ToastPositionId) => {
    localStorage.setItem(TOAST_POSITION_STORAGE_KEY, next)
    setPositionState(next)
  }

  const resetPosition = () => {
    localStorage.removeItem(TOAST_POSITION_STORAGE_KEY)
    setPositionState(DEFAULT_TOAST_POSITION)
  }

  return (
    <ToastPositionContext
      value={{
        position,
        defaultPosition: DEFAULT_TOAST_POSITION,
        setPosition,
        resetPosition,
      }}
    >
      {children}
    </ToastPositionContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastPosition() {
  const context = useContext(ToastPositionContext)
  if (!context) {
    throw new Error(
      'useToastPosition must be used within ToastPositionProvider'
    )
  }
  return context
}
