import i18n from '@/i18n'
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
} from '@/i18n/languages'
import { useTranslation } from 'react-i18next'

export function useLanguage() {
  const { i18n: i18nInstance } = useTranslation()

  const setLanguage = (code: SupportedLanguageCode) => {
    void i18nInstance.changeLanguage(code)
  }

  return {
    language: (i18nInstance.language || i18n.language) as SupportedLanguageCode,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
  }
}
