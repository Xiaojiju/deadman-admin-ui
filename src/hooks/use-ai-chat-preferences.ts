import { useCallback, useState } from 'react'
import {
  type AiChatPreferences,
  DEFAULT_AI_CHAT_PREFERENCES,
  loadAiChatPreferences,
  saveAiChatPreferences,
} from '@/lib/ai-chat/preferences'

export function useAiChatPreferences() {
  const [preferences, setPreferences] = useState<AiChatPreferences>(() =>
    loadAiChatPreferences()
  )

  const updatePreferences = useCallback((next: AiChatPreferences) => {
    setPreferences(next)
    saveAiChatPreferences(next)
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_AI_CHAT_PREFERENCES)
    saveAiChatPreferences(DEFAULT_AI_CHAT_PREFERENCES)
  }, [])

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  }
}
