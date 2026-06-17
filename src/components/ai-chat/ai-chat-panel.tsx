import { useCallback, useState } from 'react'
import { ChevronRight, History, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useAiChatAutoScroll } from '@/hooks/use-ai-chat-auto-scroll'
import { useAiChatSessions } from '@/hooks/use-ai-chat-sessions'
import { useAiChatPreferences } from '@/hooks/use-ai-chat-preferences'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AiChatComposer } from './ai-chat-composer'
import { AiChatHistoryPanel } from './ai-chat-history-panel'
import { AiChatMessageList } from './ai-chat-message-list'
import { AiChatSettingsDialog } from './ai-chat-settings-dialog'

type AiChatPanelProps = {
  onClose?: () => void
  className?: string
}

type PanelView = 'chat' | 'history'

const DEFAULT_SUGGESTIONS = [
  'introduceYourself',
  'summarizePage',
  'helpWithTask',
] as const

export function AiChatPanel({ onClose, className }: AiChatPanelProps) {
  const { t } = useTranslation('layout')
  const [input, setInput] = useState('')
  const [view, setView] = useState<PanelView>('chat')
  const { sessions, activeSession, createNewChat, selectSession, sendMessage, updateMessage } =
    useAiChatSessions()
  const { preferences, updatePreferences } = useAiChatPreferences()

  const messages = activeSession?.messages ?? []
  const hasUserMessages = messages.some((message) => message.role === 'user')
  const showSuggestions = view === 'chat' && !hasUserMessages

  const { bottomRef, scrollToBottom } = useAiChatAutoScroll(
    messages,
    activeSession?.id,
    view === 'chat'
  )

  const handleScrollRequest = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleSend = ({
    hasAttachments,
    thinkingEnabled,
  }: {
    hasAttachments: boolean
    thinkingEnabled: boolean
  }) => {
    const trimmed = input.trim()
    if (!trimmed && !hasAttachments) return
    sendMessage(trimmed || t('aiChat.sentWithAttachments'), { thinkingEnabled })
    setInput('')
  }

  const handleStreamComplete = (messageId: string) => {
    if (!activeSession) return
    updateMessage(activeSession.id, messageId, {
      status: 'complete',
      thinkingCollapsed: true,
    })
  }

  const handleNewChat = () => {
    createNewChat()
    setView('chat')
    setInput('')
  }

  const handleSelectSession = (sessionId: string) => {
    selectSession(sessionId)
    setView('chat')
    setInput('')
  }

  return (
    <div
      className={cn(
        'flex h-[min(780px,calc(100svh-4rem))] w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/50 bg-background/75 shadow-2xl backdrop-blur-xl',
        className
      )}
    >
      {view === 'history' ? (
        <AiChatHistoryPanel
          sessions={sessions}
          activeSessionId={activeSession?.id ?? ''}
          onBack={() => setView('chat')}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
        />
      ) : (
        <>
          <header className='flex shrink-0 items-center gap-2 border-b border-border/40 px-3 py-2.5'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-7 shrink-0 rounded-full'
              onClick={onClose}
              aria-label={t('aiChat.close')}
            >
              <X className='size-4' />
            </Button>

            <h2 className='min-w-0 flex-1 truncate px-1 text-center text-sm font-medium'>
              {activeSession?.title ?? t('aiChat.newChatTitle')}
            </h2>

            <div className='flex shrink-0 items-center gap-0.5'>
              <AiChatSettingsDialog
                preferences={preferences}
                onSave={updatePreferences}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 rounded-full'
                aria-label={t('aiChat.history')}
                onClick={() => setView('history')}
              >
                <History className='size-3.5' />
              </Button>
              <Separator orientation='vertical' className='mx-1 h-4' />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 gap-1 rounded-full px-2 text-xs'
                onClick={handleNewChat}
              >
                <Plus className='size-3.5' />
                {t('aiChat.newChat')}
              </Button>
            </div>
          </header>

          <ScrollArea className='min-h-0 flex-1'>
            <div className='flex flex-col gap-6 px-4 py-5'>
              <AiChatMessageList
                messages={messages}
                onStreamComplete={handleStreamComplete}
                onScrollRequest={handleScrollRequest}
              />

              {showSuggestions ? (
                <div className='flex flex-col gap-2'>
                  {DEFAULT_SUGGESTIONS.map((key) => (
                    <button
                      key={key}
                      type='button'
                      className='flex w-full items-center justify-between rounded-xl bg-muted/70 px-3.5 py-2.5 text-start text-sm transition-colors hover:bg-muted'
                      onClick={() => setInput(t(`aiChat.suggestions.${key}`))}
                    >
                      <span>{t(`aiChat.suggestions.${key}`)}</span>
                      <ChevronRight className='size-4 shrink-0 text-muted-foreground' />
                    </button>
                  ))}
                </div>
              ) : null}
              <div ref={bottomRef} aria-hidden className='h-px shrink-0' />
            </div>
          </ScrollArea>

          <footer className='shrink-0 border-t border-border/40 p-3'>
            <AiChatComposer
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
            />
          </footer>
        </>
      )}
    </div>
  )
}
