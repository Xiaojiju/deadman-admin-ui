import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type InboxNotificationToastProps = {
  toastId: string | number
  title: string
  description: string
  viewLabel: string
  onView: () => void
  className?: string
}

export function InboxNotificationToast({
  toastId,
  title,
  description,
  viewLabel,
  onView,
  className,
}: InboxNotificationToastProps) {
  return (
    <div
      className={cn(
        'flex w-full min-w-[320px] max-w-[420px] flex-col gap-2 rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg',
        className
      )}
    >
      <p className='text-sm leading-snug font-semibold'>{title}</p>
      <p className='line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
        {description}
      </p>
      <div className='flex justify-end pt-1'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => {
            onView()
            toast.dismiss(toastId)
          }}
        >
          {viewLabel}
        </Button>
      </div>
    </div>
  )
}
