import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  TOAST_POSITIONS,
  type ToastPositionId,
} from '@/constants/toast-positions'
import { useToastPosition } from '@/context/toast-position-provider'
import { Button } from '@/components/ui/button'

const PREVIEW_POSITION_CLASS: Record<ToastPositionId, string> = {
  'top-left': 'top-1.5 start-1.5',
  'top-center': 'top-1.5 start-1/2 -translate-x-1/2',
  'top-right': 'top-1.5 end-1.5',
  'bottom-left': 'bottom-1.5 start-1.5',
  'bottom-center': 'bottom-1.5 start-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-1.5 end-1.5',
}

function PositionPreview({ position }: { position: ToastPositionId }) {
  return (
    <span
      className='relative block h-14 w-full overflow-hidden rounded-md border border-border bg-muted/40'
      aria-hidden='true'
    >
      <span
        className={cn(
          'absolute h-2 w-10 rounded-sm bg-primary/80 shadow-sm',
          PREVIEW_POSITION_CLASS[position]
        )}
      />
    </span>
  )
}

type ToastPositionSwitcherProps = {
  className?: string
  showPreviewToast?: boolean
}

export function ToastPositionSwitcher({
  className,
  showPreviewToast = true,
}: ToastPositionSwitcherProps) {
  const { t } = useTranslation('settings')
  const { position, setPosition } = useToastPosition()

  const handleSelect = (id: ToastPositionId) => {
    setPosition(id)
    if (showPreviewToast) {
      toast.success(t('notifications.previewToast'), { position: id })
    }
  }

  return (
    <div
      className={cn('grid grid-cols-3 gap-3', className)}
      role='radiogroup'
      aria-label={t('notifications.positionTitle')}
    >
      {TOAST_POSITIONS.map((item) => {
        const selected = position === item.id

        return (
          <Button
            key={item.id}
            type='button'
            variant='outline'
            role='radio'
            aria-checked={selected}
            aria-label={t(item.labelKey)}
            className={cn(
              'relative h-auto flex-col gap-2 px-2 py-3',
              selected && 'border-primary ring-1 ring-primary'
            )}
            onClick={() => handleSelect(item.id)}
          >
            <span className='relative w-full'>
              <PositionPreview position={item.id} />
              {selected ? (
                <span className='absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'>
                  <Check className='size-3' />
                </span>
              ) : null}
            </span>
            <span className='text-xs font-normal'>{t(item.labelKey)}</span>
          </Button>
        )
      })}
    </div>
  )
}
