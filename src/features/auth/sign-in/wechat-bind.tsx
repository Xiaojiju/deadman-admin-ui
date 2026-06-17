import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getWechatBindToken } from '@/lib/auth/wechat-bind-session'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { WechatBindForm } from './components/wechat-bind-form'

export function WechatBind() {
  const { redirect: redirectTo } = useSearch({
    from: '/(auth)/sign-in/wechat-bind',
  })
  const { t } = useTranslation('auth')
  const bindToken = getWechatBindToken()

  if (!bindToken) {
    return (
      <AuthLayout>
        <Card className='max-w-sm gap-4'>
          <CardHeader>
            <CardTitle className='text-lg tracking-tight'>
              {t('wechat.bindTitle')}
            </CardTitle>
            <CardDescription>{t('wechat.bindTokenMissing')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link to='/sign-in'>{t('wechat.backToSignIn')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {t('wechat.bindTitle')}
          </CardTitle>
          <CardDescription>{t('wechat.bindDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <WechatBindForm bindToken={bindToken} redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
