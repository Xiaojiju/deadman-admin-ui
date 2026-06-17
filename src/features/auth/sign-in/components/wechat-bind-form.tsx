import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { completeSignIn } from '@/lib/auth/complete-sign-in'
import { clearWechatBindToken } from '@/lib/auth/wechat-bind-session'
import { ApiError } from '@/lib/http/api-error'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const BIND_TOKEN_EXPIRED_CODE = 12032

function createFormSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(1, t('validation.usernameRequired'))
      .min(3, t('validation.usernameMin')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(8, t('validation.passwordMin')),
  })
}

type WechatBindFormProps = {
  bindToken: string
  redirectTo?: string
}

export function WechatBindForm({ bindToken, redirectTo }: WechatBindFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const formSchema = useMemo(() => createFormSchema(t), [t])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const token = await authApi.bindWechatWeb({
        bindToken,
        username: data.username,
        password: data.password,
      })
      const profile = await completeSignIn(token)
      clearWechatBindToken()
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      toast.success(
        t('welcomeBack', { name: profile.nickname || data.username })
      )
    } catch (error) {
      if (error instanceof ApiError && error.code === BIND_TOKEN_EXPIRED_CODE) {
        clearWechatBindToken()
        toast.error(t('wechat.bindTokenExpired'))
        navigate({
          to: '/sign-in',
          search: { error: 'wechat_bind_expired' },
          replace: true,
        })
        return
      }

      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : t('wechat.bindFailed')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form className='grid gap-3' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('username')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('usernamePlaceholder')}
                  autoComplete='username'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('passwordPlaceholder')}
                  autoComplete='current-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          {t('wechat.bindSubmit')}
        </Button>
        <Button type='button' variant='link' className='h-auto p-0' asChild>
          <Link to='/sign-in'>{t('wechat.backToSignIn')}</Link>
        </Button>
      </form>
    </Form>
  )
}
