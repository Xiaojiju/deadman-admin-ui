import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  COLOR_THEME_LINK_ID,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  getColorThemeHref,
  isColorThemeId,
  type ColorThemeId,
} from '@/constants/color-themes'

type ColorThemeProviderState = {
  colorTheme: ColorThemeId
  defaultColorTheme: ColorThemeId
  setColorTheme: (theme: ColorThemeId) => void
  resetColorTheme: () => void
}

const ColorThemeContext = createContext<ColorThemeProviderState | null>(null)

function readStoredColorTheme(): ColorThemeId {
  try {
    const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
    if (stored && isColorThemeId(stored)) return stored
  } catch {
    // ignore
  }
  return DEFAULT_COLOR_THEME
}

function applyColorThemeStylesheet(theme: ColorThemeId) {
  let link = document.getElementById(
    COLOR_THEME_LINK_ID
  ) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.id = COLOR_THEME_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  link.href = getColorThemeHref(theme)
}

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] =
    useState<ColorThemeId>(readStoredColorTheme)

  useEffect(() => {
    applyColorThemeStylesheet(colorTheme)
  }, [colorTheme])

  const setColorTheme = (theme: ColorThemeId) => {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme)
    setColorThemeState(theme)
  }

  const resetColorTheme = () => {
    localStorage.removeItem(COLOR_THEME_STORAGE_KEY)
    setColorThemeState(DEFAULT_COLOR_THEME)
  }

  return (
    <ColorThemeContext
      value={{
        colorTheme,
        defaultColorTheme: DEFAULT_COLOR_THEME,
        setColorTheme,
        resetColorTheme,
      }}
    >
      {children}
    </ColorThemeContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useColorTheme() {
  const context = useContext(ColorThemeContext)
  if (!context) {
    throw new Error('useColorTheme must be used within ColorThemeProvider')
  }
  return context
}
