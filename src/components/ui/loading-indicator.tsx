import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const sizeClass = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const

type LoadingIndicatorProps = {
  size?: keyof typeof sizeClass
  className?: string
}

export function LoadingIndicator({
  size = 'md',
  className,
}: LoadingIndicatorProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClass[size],
        className
      )}
      aria-hidden
    />
  )
}

type LoadingCenterProps = LoadingIndicatorProps & {
  wrapperClassName?: string
}

export function LoadingCenter({
  size = 'md',
  className,
  wrapperClassName,
}: LoadingCenterProps) {
  return (
    <div className={cn('flex justify-center py-8', wrapperClassName)}>
      <LoadingIndicator size={size} className={className} />
    </div>
  )
}
