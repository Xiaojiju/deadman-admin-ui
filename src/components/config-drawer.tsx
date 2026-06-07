import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { useColorTheme } from '@/context/color-theme-provider'
import { useToastPosition } from '@/context/toast-position-provider'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ColorThemeSwitcher } from '@/components/color-theme-switcher'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useSidebar } from './ui/sidebar'

export function ConfigDrawer() {
  const { t } = useTranslation(['layout', 'common'])
  const { setOpen } = useSidebar()
  const { resetColorTheme } = useColorTheme()
  const { resetPosition } = useToastPosition()
  const { resetDir } = useDirection()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    setOpen(true)
    resetDir()
    resetTheme()
    resetColorTheme()
    resetPosition()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label={t('layout:config.openAria')}
          className='rounded-full'
        >
          <Settings aria-hidden='true' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>{t('layout:config.title')}</SheetTitle>
          <SheetDescription>{t('layout:config.description')}</SheetDescription>
        </SheetHeader>
        <div className='space-y-6 overflow-y-auto px-4'>
          <ThemeConfig />
          <ColorThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
          <LanguageConfig />
        </div>
        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
            aria-label={t('layout:config.resetAria')}
          >
            {t('common:reset')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          type='button'
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  const { t } = useTranslation('layout')

  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={t('config.selectOption', { label: item.label })}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={t('config.optionPreview', { label: item.label })}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

function ThemeConfig() {
  const { t } = useTranslation(['layout', 'common'])
  const { defaultTheme, theme, setTheme } = useTheme()

  const items = [
    {
      value: 'system',
      label: t('common:themeSystem'),
      icon: IconThemeSystem,
    },
    {
      value: 'light',
      label: t('common:themeLight'),
      icon: IconThemeLight,
    },
    {
      value: 'dark',
      label: t('common:themeDark'),
      icon: IconThemeDark,
    },
  ]

  return (
    <div>
      <SectionTitle
        title={t('layout:config.theme')}
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
        resetAriaLabel={t('layout:config.themeResetAria')}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('layout:config.themeSelectAria')}
        aria-describedby='theme-description'
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
      <div id='theme-description' className='sr-only'>
        {t('layout:config.themeDesc')}
      </div>
    </div>
  )
}

function ColorThemeConfig() {
  const { t } = useTranslation('layout')
  const { colorTheme, defaultColorTheme, resetColorTheme } = useColorTheme()

  return (
    <div>
      <SectionTitle
        title={t('config.colorTheme')}
        showReset={colorTheme !== defaultColorTheme}
        onReset={resetColorTheme}
        resetAriaLabel={t('config.colorThemeResetAria')}
      />
      <p className='mb-3 text-xs text-muted-foreground'>
        {t('config.colorThemeDesc')}
      </p>
      <ColorThemeSwitcher />
    </div>
  )
}

function SidebarConfig() {
  const { t } = useTranslation('layout')
  const { defaultVariant, variant, setVariant } = useLayout()

  const items = [
    {
      value: 'inset',
      label: t('config.sidebarVariants.inset'),
      icon: IconSidebarInset,
    },
    {
      value: 'floating',
      label: t('config.sidebarVariants.floating'),
      icon: IconSidebarFloating,
    },
    {
      value: 'sidebar',
      label: t('config.sidebarVariants.sidebar'),
      icon: IconSidebarSidebar,
    },
  ]

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title={t('config.sidebar')}
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
        resetAriaLabel={t('config.sidebarResetAria')}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('config.sidebarSelectAria')}
        aria-describedby='sidebar-description'
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='sidebar-description' className='sr-only'>
        {t('config.sidebarDesc')}
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { t } = useTranslation('layout')
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()

  const radioState = open ? 'default' : collapsible

  const items = [
    {
      value: 'default',
      label: t('config.layoutVariants.default'),
      icon: IconLayoutDefault,
    },
    {
      value: 'icon',
      label: t('config.layoutVariants.compact'),
      icon: IconLayoutCompact,
    },
    {
      value: 'offcanvas',
      label: t('config.layoutVariants.fullLayout'),
      icon: IconLayoutFull,
    },
  ]

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title={t('config.layout')}
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
        resetAriaLabel={t('config.layoutResetAria')}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('config.layoutSelectAria')}
        aria-describedby='layout-description'
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='layout-description' className='sr-only'>
        {t('config.layoutDesc')}
      </div>
    </div>
  )
}

function LanguageConfig() {
  const { t } = useTranslation('layout')
  return (
    <div>
      <SectionTitle title={t('config.language')} />
      <p className='mb-3 text-xs text-muted-foreground'>
        {t('config.languageDesc')}
      </p>
      <LanguageSwitcher />
    </div>
  )
}

function DirConfig() {
  const { t } = useTranslation('layout')
  const { defaultDir, dir, setDir } = useDirection()

  const items = [
    {
      value: 'ltr',
      label: t('config.directionLtr'),
      icon: (props: SVGProps<SVGSVGElement>) => (
        <IconDir dir='ltr' {...props} />
      ),
    },
    {
      value: 'rtl',
      label: t('config.directionRtl'),
      icon: (props: SVGProps<SVGSVGElement>) => (
        <IconDir dir='rtl' {...props} />
      ),
    },
  ]

  return (
    <div>
      <SectionTitle
        title={t('config.direction')}
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
        resetAriaLabel={t('config.directionResetAria')}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t('config.directionSelectAria')}
        aria-describedby='direction-description'
      >
        {items.map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id='direction-description' className='sr-only'>
        {t('config.directionDesc')}
      </div>
    </div>
  )
}
