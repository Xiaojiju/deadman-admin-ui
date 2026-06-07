import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-provider'
import { useToastPosition } from '@/context/toast-position-provider'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()
  const { position } = useToastPosition()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position={position}
      expand
      visibleToasts={6}
      gap={10}
      className='toaster group [&_[data-sonner-toaster]]:flex [&_[data-sonner-toaster]]:flex-col [&_[data-sonner-toast]]:w-full [&_div[data-content]]:w-full'
      toastOptions={{
        classNames: {
          toast: 'w-full items-stretch',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
