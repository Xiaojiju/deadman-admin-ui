export const AI_CHAT_PREFERENCES_KEY = 'deadman-ai-chat-preferences'

export const AI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'claude-sonnet'] as const
export const AI_TONES = ['professional', 'friendly', 'concise'] as const
export const AI_SCENES = ['general', 'coding', 'writing'] as const
export const OUTPUT_LANGUAGES = ['zh-CN', 'en'] as const

export type AiChatModel = (typeof AI_MODELS)[number]
export type AiChatTone = (typeof AI_TONES)[number]
export type AiChatScene = (typeof AI_SCENES)[number]
export type AiChatOutputLanguage = (typeof OUTPUT_LANGUAGES)[number]

export type AiChatPreferences = {
  model: AiChatModel
  tone: AiChatTone
  scene: AiChatScene
  outputLanguage: AiChatOutputLanguage
}

export const DEFAULT_AI_CHAT_PREFERENCES: AiChatPreferences = {
  model: 'gpt-4o',
  tone: 'professional',
  scene: 'general',
  outputLanguage: 'zh-CN',
}

export function loadAiChatPreferences(): AiChatPreferences {
  try {
    const raw = localStorage.getItem(AI_CHAT_PREFERENCES_KEY)
    if (!raw) return DEFAULT_AI_CHAT_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<AiChatPreferences>
    return {
      model: AI_MODELS.includes(parsed.model as AiChatModel)
        ? (parsed.model as AiChatModel)
        : DEFAULT_AI_CHAT_PREFERENCES.model,
      tone: AI_TONES.includes(parsed.tone as AiChatTone)
        ? (parsed.tone as AiChatTone)
        : DEFAULT_AI_CHAT_PREFERENCES.tone,
      scene: AI_SCENES.includes(parsed.scene as AiChatScene)
        ? (parsed.scene as AiChatScene)
        : DEFAULT_AI_CHAT_PREFERENCES.scene,
      outputLanguage: OUTPUT_LANGUAGES.includes(
        parsed.outputLanguage as AiChatOutputLanguage
      )
        ? (parsed.outputLanguage as AiChatOutputLanguage)
        : DEFAULT_AI_CHAT_PREFERENCES.outputLanguage,
    }
  } catch {
    return DEFAULT_AI_CHAT_PREFERENCES
  }
}

export function saveAiChatPreferences(preferences: AiChatPreferences): void {
  localStorage.setItem(AI_CHAT_PREFERENCES_KEY, JSON.stringify(preferences))
}
