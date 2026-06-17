import type { ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

type LoadingButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
    asChild?: boolean
  }

export function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn('gap-2', className)}
      {...props}
    >
      {loading ? <Loader2 className='size-4 animate-spin' /> : null}
      {children}
    </Button>
  )
}
