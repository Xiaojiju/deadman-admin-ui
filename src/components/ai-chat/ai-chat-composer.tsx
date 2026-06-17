import { useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  Brain,
  FileText,
  Globe,
  Mic,
  Paperclip,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  type ChatAttachment,
  createAttachmentFromFile,
  revokeAttachmentPreview,
  revokeAttachmentPreviews,
} from '@/lib/ai-chat/attachments'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

type AiChatComposerProps = {
  input: string
  onInputChange: (value: string) => void
  onSend: (options: {
    hasAttachments: boolean
    thinkingEnabled: boolean
  }) => void
}

function toggleButtonClass(active: boolean) {
  return cn(
    'h-7 gap-1 rounded-full px-2 text-xs text-muted-foreground',
    active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
  )
}

export function AiChatComposer({
  input,
  onInputChange,
  onSend,
}: AiChatComposerProps) {
  const { t } = useTranslation('layout')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachmentsRef = useRef<ChatAttachment[]>([])
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [thinkingEnabled, setThinkingEnabled] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)

  attachmentsRef.current = attachments

  useEffect(() => {
    return () => revokeAttachmentPreviews(attachmentsRef.current)
  }, [])

  const imageAttachments = attachments.filter(
    (attachment) => attachment.kind === 'image'
  )
  const fileAttachments = attachments.filter(
    (attachment) => attachment.kind === 'file'
  )
  const hasAttachments = attachments.length > 0
  const canSend = input.trim().length > 0 || hasAttachments

  const handlePickFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    const next = Array.from(files).map(createAttachmentFromFile)
    setAttachments((prev) => [...prev, ...next])
    event.target.value = ''
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === id)
      if (target) revokeAttachmentPreview(target)
      return prev.filter((attachment) => attachment.id !== id)
    })
  }

  const handleSend = () => {
    if (!canSend) return
    onSend({ hasAttachments, thinkingEnabled })
    revokeAttachmentPreviews(attachments)
    setAttachments([])
  }

  return (
    <div className='rounded-2xl border bg-background p-3 shadow-sm'>
      <input
        ref={fileInputRef}
        type='file'
        multiple
        className='hidden'
        onChange={handleFileChange}
      />

      {hasAttachments ? (
        <>
          <div className='space-y-2 pb-3'>
            {imageAttachments.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {imageAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className='relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted/30'
                  >
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.name}
                      className='size-full object-cover'
                    />
                    <Button
                      type='button'
                      variant='secondary'
                      size='icon'
                      className='absolute top-1 inset-e-1 size-5 rounded-full shadow-sm'
                      aria-label={t('aiChat.removeAttachment')}
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className='size-3' />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            {fileAttachments.length > 0 ? (
              <div className='flex flex-col gap-1.5'>
                {fileAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className='flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5'
                  >
                    <FileText className='size-4 shrink-0 text-muted-foreground' />
                    <span className='min-w-0 flex-1 truncate text-xs'>
                      {attachment.name}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-6 shrink-0 rounded-full'
                      aria-label={t('aiChat.removeAttachment')}
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className='size-3.5' />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <Separator className='mb-3' />
        </>
      ) : null}

      <Textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            handleSend()
          }
        }}
        placeholder={t('aiChat.inputPlaceholder')}
        className='min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0'
        rows={2}
      />

      <div className='mt-2 flex items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-7 gap-1 rounded-full px-2 text-xs text-muted-foreground'
            onClick={handlePickFiles}
            aria-label={t('aiChat.attachFile')}
          >
            <Paperclip className='size-3.5' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className={toggleButtonClass(thinkingEnabled)}
            onClick={() => setThinkingEnabled((prev) => !prev)}
            aria-pressed={thinkingEnabled}
          >
            <Brain className='size-3.5' />
            {t('aiChat.thinking')}
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className={toggleButtonClass(webSearchEnabled)}
            onClick={() => setWebSearchEnabled((prev) => !prev)}
            aria-pressed={webSearchEnabled}
          >
            <Globe className='size-3.5' />
            {t('aiChat.webSearch')}
          </Button>
        </div>

        <div className='flex shrink-0 items-center gap-1.5'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 rounded-full text-muted-foreground'
            aria-label={t('aiChat.voiceInput')}
          >
            <Mic className='size-4' />
          </Button>
          <Button
            type='button'
            size='icon'
            className='size-8 rounded-full'
            disabled={!canSend}
            onClick={handleSend}
            aria-label={t('aiChat.send')}
          >
            <ArrowUp className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
