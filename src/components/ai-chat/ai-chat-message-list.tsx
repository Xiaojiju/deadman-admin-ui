import {
  Copy,
  MoreHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { copyChatText, getAvatarFallback } from '@/lib/ai-chat/copy-text'
import type { AiChatMessage } from '@/lib/ai-chat/types'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AiChatAssistantMessage } from './ai-chat-assistant-message'

type AiChatMessageItemProps = {
  message: AiChatMessage
  onStreamComplete?: (messageId: string) => void
  onScrollRequest?: () => void
}

function AiChatUserMessageItem({ message }: { message: AiChatMessage }) {
  const { t } = useTranslation('layout')
  const user = useAuthStore((state) => state.auth.user)
  const userName = user?.nickname ?? t('aiChat.userFallback')
  const userAvatar = user?.avatar?.trim() || undefined

  const handleCopy = () => {
    void copyChatText(message.content, {
      success: t('aiChat.copySuccess'),
      failed: t('aiChat.copyFailed'),
    })
  }

  return (
    <div className='flex gap-2.5'>
      <div className='flex min-w-0 flex-1 flex-col items-end gap-1'>
        <div className='max-w-[85%] rounded-2xl bg-muted px-3.5 py-2 text-sm'>
          {message.content}
        </div>
        <div className='flex items-center gap-1 text-muted-foreground'>
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
            aria-label={t('aiChat.more')}
          >
            <MoreHorizontal className='size-3' />
          </Button>
        </div>
      </div>
      <Avatar className='size-8 shrink-0'>
        {userAvatar ? (
          <AvatarImage src={userAvatar} alt={userName} />
        ) : null}
        <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function AiChatMessageItem({
  message,
  onStreamComplete,
  onScrollRequest,
}: AiChatMessageItemProps) {
  if (message.role === 'user') {
    return <AiChatUserMessageItem message={message} />
  }

  return (
    <AiChatAssistantMessage
      message={message}
      onStreamComplete={onStreamComplete}
      onScrollRequest={onScrollRequest}
    />
  )
}

type AiChatMessageListProps = {
  messages: AiChatMessage[]
  className?: string
  onStreamComplete?: (messageId: string) => void
  onScrollRequest?: () => void
}

export function AiChatMessageList({
  messages,
  className,
  onStreamComplete,
  onScrollRequest,
}: AiChatMessageListProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {messages.map((message) => (
        <AiChatMessageItem
          key={message.id}
          message={message}
          onStreamComplete={onStreamComplete}
          onScrollRequest={onScrollRequest}
        />
      ))}
    </div>
  )
}
