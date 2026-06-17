import { useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api/auth'
import { completeSignIn } from '@/lib/auth/complete-sign-in'
import { isWechatPendingBind } from '@/lib/auth/wechat'
import { setWechatBindToken } from '@/lib/auth/wechat-bind-session'
import { ApiError } from '@/lib/http/api-error'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '@/features/auth/auth-layout'

export function WechatCallback() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { code, state, redirect } = useSearch({
    from: '/(auth)/auth/wechat/callback',
  })
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    if (!code || !state) {
      navigate({
        to: '/sign-in',
        search: { error: 'wechat_missing_params' },
        replace: true,
      })
      return
    }

    authApi
      .loginWechatWeb({ code, state })
      .then(async (data) => {
        if (isWechatPendingBind(data)) {
          setWechatBindToken(data.bindToken, data.expiresIn)
          navigate({ to: '/sign-in/wechat-bind', replace: true })
          return
        }

        await completeSignIn(data)
        navigate({ to: redirect || '/', replace: true })
      })
      .catch((error) => {
        const errorKey =
          error instanceof ApiError && error.code === 12032
            ? 'wechat_bind_expired'
            : 'wechat_login_failed'
        navigate({
          to: '/sign-in',
          search: { error: errorKey },
          replace: true,
        })
      })
  }, [code, navigate, redirect, state])

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {t('wechat.callbackTitle')}
          </CardTitle>
          <CardDescription>{t('wechat.callbackDesc')}</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
