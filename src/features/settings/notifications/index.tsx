import { useTranslation } from 'react-i18next'
import { ToastPositionSwitcher } from '@/components/toast-position-switcher'
import { ContentSection } from '../components/content-section'

export function SettingsNotifications() {
  const { t } = useTranslation('settings')

  return (
    <ContentSection
      title={t('notifications.title')}
      desc={t('notifications.desc')}
    >
      <div className='space-y-3'>
        <p className='text-sm font-medium'>
          {t('notifications.positionTitle')}
        </p>
        <p className='text-sm text-muted-foreground'>
          {t('notifications.positionDesc')}
        </p>
        <ToastPositionSwitcher />
      </div>
    </ContentSection>
  )
}
