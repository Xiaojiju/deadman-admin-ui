export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeLabel: '简体中文' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
] as const

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'zh-CN'

export const LANGUAGE_STORAGE_KEY = 'deadman_language'
