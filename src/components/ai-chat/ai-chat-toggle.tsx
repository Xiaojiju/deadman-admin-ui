import { useState } from 'react'
import { Bot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AiChatPanel } from './ai-chat-panel'

type AiChatToggleProps = {
  /** 弹出方向：top 向上弹出，bottom 向下弹出 */
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  /** 点击空白处是否关闭，默认 false（仅关闭按钮关闭） */
  dismissOnOutsideClick?: boolean
  className?: string
}

function isAiChatOverlayTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      '[data-slot=select-content],[data-slot=select-trigger],[data-slot=select-item],[data-slot=dialog-content],[data-slot=dialog-overlay]'
    )
  )
}

export function AiChatToggle({
  side = 'bottom',
  align = 'end',
  dismissOnOutsideClick = false,
  className,
}: AiChatToggleProps) {
  const { t } = useTranslation('layout')
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn('scale-95 rounded-full', className)}
        >
          <Bot className='size-[1.2rem]' />
          <span className='sr-only'>{t('aiChat.open')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={12}
        collisionPadding={16}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={
          dismissOnOutsideClick
            ? undefined
            : (event) => {
                if (isAiChatOverlayTarget(event.target)) return
                event.preventDefault()
              }
        }
        onPointerDownOutside={
          dismissOnOutsideClick
            ? undefined
            : (event) => {
                if (isAiChatOverlayTarget(event.target)) return
                event.preventDefault()
              }
        }
        className={cn(
          'z-100 w-auto border-0 bg-transparent p-0 shadow-none',
          'data-[side=bottom]:slide-in-from-top-4 data-[side=top]:slide-in-from-bottom-4',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
        )}
      >
        <AiChatPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
