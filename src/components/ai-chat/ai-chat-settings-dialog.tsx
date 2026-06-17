import { useEffect, useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AI_MODELS,
  AI_SCENES,
  AI_TONES,
  DEFAULT_AI_CHAT_PREFERENCES,
  OUTPUT_LANGUAGES,
  type AiChatPreferences,
} from '@/lib/ai-chat/preferences'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { AiChatOptionSelect } from './ai-chat-option-select'

type AiChatSettingsDialogProps = {
  preferences: AiChatPreferences
  onSave: (preferences: AiChatPreferences) => void
}

export function AiChatSettingsDialog({
  preferences,
  onSave,
}: AiChatSettingsDialogProps) {
  const { t } = useTranslation('layout')
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<AiChatPreferences>(preferences)

  useEffect(() => {
    if (open) setDraft(preferences)
  }, [open, preferences])

  const modelOptions = useMemo(
    () =>
      AI_MODELS.map((item) => ({
        value: item,
        label: t(`aiChat.models.${item}`),
        description: t(`aiChat.models.${item}Desc`),
      })),
    [t]
  )

  const toneOptions = useMemo(
    () =>
      AI_TONES.map((item) => ({
        value: item,
        label: t(`aiChat.tones.${item}`),
        description: t(`aiChat.tones.${item}Desc`),
      })),
    [t]
  )

  const sceneOptions = useMemo(
    () =>
      AI_SCENES.map((item) => ({
        value: item,
        label: t(`aiChat.scenes.${item}`),
        description: t(`aiChat.scenes.${item}Desc`),
      })),
    [t]
  )

  const languageOptions = useMemo(
    () =>
      OUTPUT_LANGUAGES.map((item) => ({
        value: item,
        label: t(`aiChat.outputLanguages.${item}`),
        description: t(`aiChat.outputLanguages.${item}Desc`),
      })),
    [t]
  )

  const handleSave = () => {
    onSave(draft)
    setOpen(false)
  }

  const handleReset = () => {
    setDraft(DEFAULT_AI_CHAT_PREFERENCES)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 rounded-full'
          aria-label={t('aiChat.settings.open')}
        >
          <Settings2 className='size-3.5' />
        </Button>
      </DialogTrigger>
      <DialogContent
        className='z-120 gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md [&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:inset-e-4 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:border [&_[data-slot=dialog-close]]:bg-background'
        overlayClassName='z-120'
      >
        <DialogHeader className='space-y-1 border-b px-6 py-5 pe-14 text-start'>
          <DialogTitle className='text-xl font-semibold'>
            {t('aiChat.settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('aiChat.settings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5 px-6 py-5'>
          <AiChatOptionSelect
            variant='preferences'
            label={t('aiChat.model')}
            description={t('aiChat.settings.fields.modelDesc')}
            value={draft.model}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, model: value as typeof prev.model }))
            }
            placeholder={t('aiChat.model')}
            ariaLabel={t('aiChat.model')}
            options={modelOptions}
          />

          <Separator />

          <AiChatOptionSelect
            variant='preferences'
            label={t('aiChat.tone')}
            description={t('aiChat.settings.fields.toneDesc')}
            value={draft.tone}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, tone: value as typeof prev.tone }))
            }
            placeholder={t('aiChat.tone')}
            ariaLabel={t('aiChat.tone')}
            options={toneOptions}
          />

          <Separator />

          <AiChatOptionSelect
            variant='preferences'
            label={t('aiChat.scene')}
            description={t('aiChat.settings.fields.sceneDesc')}
            value={draft.scene}
            onValueChange={(value) =>
              setDraft((prev) => ({ ...prev, scene: value as typeof prev.scene }))
            }
            placeholder={t('aiChat.scene')}
            ariaLabel={t('aiChat.scene')}
            options={sceneOptions}
          />

          <Separator />

          <AiChatOptionSelect
            variant='preferences'
            label={t('aiChat.outputLanguage')}
            description={t('aiChat.settings.fields.outputLanguageDesc')}
            value={draft.outputLanguage}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                outputLanguage: value as typeof prev.outputLanguage,
              }))
            }
            placeholder={t('aiChat.outputLanguage')}
            ariaLabel={t('aiChat.outputLanguage')}
            options={languageOptions}
          />
        </div>

        <DialogFooter className='flex-row justify-between border-t px-6 py-4 sm:justify-between'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full'
            onClick={handleReset}
          >
            {t('aiChat.settings.reset')}
          </Button>
          <Button type='button' className='rounded-full' onClick={handleSave}>
            {t('aiChat.settings.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
