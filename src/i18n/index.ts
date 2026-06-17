import i18n, { type Resource } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from './languages'

const localeModules = import.meta.glob('../locales/*/*.json', { eager: true })

type ResourceBundle = Record<string, Record<string, unknown>>

function buildResources(): ResourceBundle {
  const resources: ResourceBundle = {}

  for (const [path, module] of Object.entries(localeModules)) {
    const match = path.match(/locales\/([^/]+)\/([^/]+)\.json$/)
    if (!match) continue

    const [, lng, ns] = match
    const content = (module as { default?: unknown }).default ?? module

    resources[lng] ??= {}
    resources[lng][ns] = content as Record<string, unknown>
  }

  return resources
}

export const i18nNamespaces = [
  'common',
  'auth',
  'layout',
  'settings',
  'system',
  'department',
  'position',
  'errors',
  'dashboard',
  'notification',
  'client',
] as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources() as Resource,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: {
      'zh-TW': ['zh-CN', 'en'],
      'zh-HK': ['zh-CN', 'en'],
      default: ['en'],
    },
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    nonExplicitSupportedLngs: false,
    ns: [...i18nNamespaces],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      // 仅读取用户手动选择；未选择时使用 lng 默认值（zh-CN）
      order: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

const supportedCodes = SUPPORTED_LANGUAGES.map((l) => l.code)
if (
  !supportedCodes.includes(i18n.language as (typeof supportedCodes)[number])
) {
  void i18n.changeLanguage(DEFAULT_LANGUAGE)
}

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

document.documentElement.lang = i18n.language || DEFAULT_LANGUAGE

export default i18n
