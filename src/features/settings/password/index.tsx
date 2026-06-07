import { useTranslation } from 'react-i18next'
import { ContentSection } from '../components/content-section'
import { PasswordForm } from './password-form'

export function SettingsPassword() {
  const { t } = useTranslation('settings')
  return (
    <ContentSection title={t('password.title')} desc={t('password.desc')}>
      <PasswordForm />
    </ContentSection>
  )
}
