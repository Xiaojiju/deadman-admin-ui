import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { COLOR_THEMES } from '@/constants/color-themes'
import { useColorTheme } from '@/context/color-theme-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ColorThemeSwitcherProps = {
  className?: string
}

export function ColorThemeSwitcher({ className }: ColorThemeSwitcherProps) {
  const { t } = useTranslation('layout')
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <div
      className={cn('grid grid-cols-4 gap-3', className)}
      role='radiogroup'
      aria-label={t('config.colorTheme')}
    >
      {COLOR_THEMES.map((theme) => {
        const selected = colorTheme === theme.id

        return (
          <Button
            key={theme.id}
            type='button'
            variant='outline'
            role='radio'
            aria-checked={selected}
            aria-label={t(theme.labelKey)}
            className={cn(
              'relative h-auto flex-col gap-2 px-2 py-3',
              selected && 'border-primary ring-1 ring-primary'
            )}
            onClick={() => setColorTheme(theme.id)}
          >
            <span
              className='relative flex size-8 items-center justify-center rounded-full border border-border shadow-sm'
              style={{ backgroundColor: theme.swatch }}
            >
              {selected ? (
                <Check className='size-4 text-white drop-shadow-sm' />
              ) : null}
            </span>
            <span className='text-xs font-normal'>{t(theme.labelKey)}</span>
          </Button>
        )
      })}
    </div>
  )
}
