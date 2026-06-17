import { useEffect, useState } from 'react'
import {
  Bot,
  ChevronDown,
  Copy,
  MoreHorizontal,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { copyChatText } from '@/lib/ai-chat/copy-text'
import type { AiChatMessage } from '@/lib/ai-chat/types'
import { useTypewriter } from '@/hooks/use-typewriter'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'

type StreamPhase = 'thinking' | 'reply' | 'done'

type AiChatAssistantMessageProps = {
  message: AiChatMessage
  onStreamComplete?: (messageId: string) => void
  onScrollRequest?: () => void
}

export function AiChatAssistantMessage({
  message,
  onStreamComplete,
  onScrollRequest,
}: AiChatAssistantMessageProps) {
  const { t } = useTranslation('layout')
  const isStreaming = message.status === 'streaming'
  const hasThinking = Boolean(message.thinking)

  const [phase, setPhase] = useState<StreamPhase>(() => {
    if (!isStreaming) return 'done'
    return hasThinking ? 'thinking' : 'reply'
  })
  const [thinkingOpen, setThinkingOpen] = useState(() => {
    if (!hasThinking) return false
    if (isStreaming) return phase === 'thinking'
    return !message.thinkingCollapsed
  })

  const thinkingActive = isStreaming && phase === 'thinking'
  const replyActive = isStreaming && phase === 'reply'

  const { displayed: thinkingDisplayed, done: thinkingDone } = useTypewriter(
    message.thinking ?? '',
    { active: thinkingActive }
  )

  const { displayed: replyDisplayed, done: replyDone } = useTypewriter(
    message.content,
    { active: replyActive || (isStreaming && !hasThinking) }
  )

  useEffect(() => {
    if (!isStreaming || !hasThinking || phase !== 'thinking' || !thinkingDone) {
      return
    }

    const timer = window.setTimeout(() => {
      setThinkingOpen(false)
      setPhase('reply')
    }, 400)

    return () => window.clearTimeout(timer)
  }, [hasThinking, isStreaming, phase, thinkingDone])

  useEffect(() => {
    if (!isStreaming || phase !== 'reply' || !replyDone) return

    const timer = window.setTimeout(() => {
      setPhase('done')
      onStreamComplete?.(message.id)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [isStreaming, message.id, onStreamComplete, phase, replyDone])

  useEffect(() => {
    if (!isStreaming && hasThinking) {
      setThinkingOpen(!message.thinkingCollapsed)
    }
  }, [hasThinking, isStreaming, message.thinkingCollapsed])

  useEffect(() => {
    if (!isStreaming) return
    onScrollRequest?.()
  }, [
    isStreaming,
    onScrollRequest,
    phase,
    replyDisplayed,
    thinkingDisplayed,
  ])

  const replyText =
    isStreaming && phase !== 'done'
      ? hasThinking
        ? phase === 'reply'
          ? replyDisplayed
          : ''
        : replyDisplayed
      : message.content

  const showActions = !isStreaming || phase === 'done'
  const showThinkingSection = hasThinking && (phase !== 'thinking' || !isStreaming)
  const thinkingText =
    isStreaming && phase === 'thinking'
      ? thinkingDisplayed
      : (message.thinking ?? '')

  const handleCopy = () => {
    void copyChatText(message.content, {
      success: t('aiChat.copySuccess'),
      failed: t('aiChat.copyFailed'),
    })
  }

  return (
    <div className='flex gap-2.5'>
      <Avatar className='size-8 shrink-0 bg-primary/10'>
        <AvatarFallback className='bg-primary/10 text-primary'>
          <Bot className='size-4' />
        </AvatarFallback>
      </Avatar>
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        {isStreaming && phase === 'thinking' ? (
          <div className='rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5'>
            <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
              {t('aiChat.thinkingInProgress')}
            </p>
            <p className='text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
              {thinkingText}
              <span className='animate-pulse'>|</span>
            </p>
          </div>
        ) : null}

        {replyText ? (
          <p className='text-sm leading-relaxed whitespace-pre-wrap'>
            {replyText}
            {isStreaming && phase === 'reply' && !replyDone ? (
              <span className='animate-pulse'>|</span>
            ) : null}
          </p>
        ) : null}

        {showThinkingSection ? (
          <Collapsible open={thinkingOpen} onOpenChange={setThinkingOpen}>
            <CollapsibleTrigger asChild>
              <button
                type='button'
                className='flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
              >
                <ChevronDown
                  className={cn(
                    'size-3.5 transition-transform',
                    thinkingOpen && 'rotate-180'
                  )}
                />
                {t('aiChat.thinkingProcess')}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className='mt-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5'>
                <p className='text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground'>
                  {thinkingText}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : null}

        {showActions ? (
          <div className='flex items-center gap-0.5 text-muted-foreground'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full'
              aria-label={t('aiChat.speak')}
            >
              <Volume2 className='size-3' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full'
              aria-label={t('aiChat.copy')}
              onClick={handleCopy}
            >
              <Copy className='size-3' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full'
              aria-label={t('aiChat.regenerate')}
            >
              <RefreshCw className='size-3' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full'
              aria-label={t('aiChat.more')}
            >
              <MoreHorizontal className='size-3' />
            </Button>
            <Separator orientation='vertical' className='mx-1 h-3.5' />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full'
              aria-label={t('aiChat.thumbsUp')}
            >
              <ThumbsUp className='size-3' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-6 rounded-full'
              aria-label={t('aiChat.thumbsDown')}
            >
              <ThumbsDown className='size-3' />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
