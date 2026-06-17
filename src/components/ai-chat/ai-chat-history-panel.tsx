import { ChevronLeft, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { AiChatSession } from '@/lib/ai-chat/types'
import { getSessionPreview, truncateTitle } from '@/lib/ai-chat/storage'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type AiChatHistoryPanelProps = {
  sessions: AiChatSession[]
  activeSessionId: string
  onBack: () => void
  onSelect: (sessionId: string) => void
  onNewChat: () => void
}

export function AiChatHistoryPanel({
  sessions,
  activeSessionId,
  onBack,
  onSelect,
  onNewChat,
}: AiChatHistoryPanelProps) {
  const { t, i18n } = useTranslation('layout')
  const dateLocale = i18n.language.startsWith('zh') ? zhCN : enUS

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex shrink-0 items-center gap-2 border-b border-border/40 px-3 py-2.5'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 rounded-full'
          onClick={onBack}
          aria-label={t('aiChat.backToChat')}
        >
          <ChevronLeft className='size-4' />
        </Button>
        <h2 className='flex-1 truncate text-sm font-medium'>
          {t('aiChat.history')}
        </h2>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 rounded-full px-2 text-xs'
          onClick={onNewChat}
        >
          {t('aiChat.newChat')}
        </Button>
      </div>

      <ScrollArea className='min-h-0 flex-1'>
        <div className='flex flex-col gap-1 p-2'>
          {sessions.length === 0 ? (
            <p className='px-3 py-8 text-center text-sm text-muted-foreground'>
              {t('aiChat.emptyHistory')}
            </p>
          ) : (
            sessions.map((session) => {
              const preview = truncateTitle(getSessionPreview(session), 48)
              const isActive = session.id === activeSessionId

              return (
                <button
                  key={session.id}
                  type='button'
                  onClick={() => onSelect(session.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-muted/70',
                    isActive && 'bg-muted'
                  )}
                >
                  <div className='mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <MessageSquare className='size-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='truncate text-sm font-medium'>
                        {session.title}
                      </p>
                      <span className='shrink-0 text-xs text-muted-foreground'>
                        {formatDistanceToNow(new Date(session.updatedAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </span>
                    </div>
                    {preview ? (
                      <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                        {preview}
                      </p>
                    ) : null}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
