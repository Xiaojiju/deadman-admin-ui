export const COLOR_THEMES = [
  {
    id: 'neutral',
    labelKey: 'config.colorThemes.neutral',
    swatch: 'oklch(0.205 0 0)',
  },
  {
    id: 'blue',
    labelKey: 'config.colorThemes.blue',
    swatch: 'oklch(0.488 0.243 264.376)',
  },
  {
    id: 'green',
    labelKey: 'config.colorThemes.green',
    swatch: 'oklch(0.648 0.2 131.684)',
  },
  {
    id: 'violet',
    labelKey: 'config.colorThemes.violet',
    swatch: 'oklch(0.541 0.281 293.009)',
  },
  {
    id: 'rose',
    labelKey: 'config.colorThemes.rose',
    swatch: 'oklch(0.586 0.253 17.585)',
  },
  {
    id: 'orange',
    labelKey: 'config.colorThemes.orange',
    swatch: 'oklch(0.646 0.222 41.116)',
  },
  {
    id: 'yellow',
    labelKey: 'config.colorThemes.yellow',
    swatch: 'oklch(0.852 0.199 91.936)',
  },
  {
    id: 'red',
    labelKey: 'config.colorThemes.red',
    swatch: 'oklch(0.577 0.245 27.325)',
  },
] as const

export type ColorThemeId = (typeof COLOR_THEMES)[number]['id']

export const DEFAULT_COLOR_THEME: ColorThemeId = 'neutral'

export const COLOR_THEME_STORAGE_KEY = 'deadman_color_theme'

export const COLOR_THEME_LINK_ID = 'color-theme-stylesheet'

export function getColorThemeHref(id: ColorThemeId) {
  return `/_theme/${id}.css`
}

export function isColorThemeId(value: string): value is ColorThemeId {
  return COLOR_THEMES.some((theme) => theme.id === value)
}
