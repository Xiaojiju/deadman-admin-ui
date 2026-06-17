import { useEffect, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { IconWechat } from '@/assets/brand-icons'
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
import { UserAuthForm } from './components/user-auth-form'
import { WechatQrLogin } from './components/wechat-qr-login'

type SignInMode = 'password' | 'wechat'

const ERROR_MESSAGE_KEYS: Record<string, string> = {
  wechat_missing_params: 'wechat.errors.missingParams',
  wechat_login_failed: 'wechat.errors.loginFailed',
  wechat_bind_expired: 'wechat.bindTokenExpired',
  bind_token_missing: 'wechat.bindTokenMissing',
}

export function SignIn() {
  const { redirect, error } = useSearch({ from: '/(auth)/sign-in' })
  const { t } = useTranslation('auth')
  const [mode, setMode] = useState<SignInMode>('password')
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  useEffect(() => {
    if (!error) return
    const messageKey = ERROR_MESSAGE_KEYS[error]
    toast.error(messageKey ? t(messageKey) : t('signInFailed'))
  }, [error, t])

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {mode === 'wechat' ? t('wechat.signInTitle') : t('signIn')}
          </CardTitle>
          <CardDescription>
            {mode === 'wechat' ? t('wechat.signInDesc') : t('signInDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-3'>
            {mode === 'password' ? (
              <UserAuthForm
                redirectTo={redirect}
                onLoadingChange={setIsPasswordLoading}
              />
            ) : (
              <WechatQrLogin />
            )}

            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  {t('orContinueWith')}
                </span>
              </div>
            </div>

            <Button
              variant='outline'
              type='button'
              disabled={mode === 'password' && isPasswordLoading}
              onClick={() =>
                setMode((current) =>
                  current === 'password' ? 'wechat' : 'password'
                )
              }
            >
              {mode === 'password' ? (
                <>
                  <IconWechat className='size-5' />
                  {t('wechat.brand')}
                </>
              ) : (
                <>
                  <LogIn className='size-5' />
                  {t('wechat.backToPassword')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            {t('registerHint')}
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
