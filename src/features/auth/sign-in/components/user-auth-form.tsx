import { useMemo, useState } from 'react'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { completeSignIn } from '@/lib/auth/complete-sign-in'
import { ApiError } from '@/lib/http/api-error'
import { cn } from '@/lib/utils'
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

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
  onLoadingChange?: (loading: boolean) => void
}

export function UserAuthForm({
  className,
  redirectTo,
  onLoadingChange,
  ...props
}: UserAuthFormProps) {
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
    onLoadingChange?.(true)
    try {
      const token = await authApi.login({
        username: data.username,
        password: data.password,
      })
      const profile = await completeSignIn(token)

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
      toast.success(
        t('welcomeBack', { name: profile.nickname || data.username })
      )
    } catch (error) {
      let message = t('signInFailed')
      if (error instanceof ApiError) {
        message = error.message
      } else if (error instanceof AxiosError) {
        message =
          (error.response?.data as { msg?: string } | undefined)?.msg ??
          error.message
      } else if (error instanceof Error) {
        message = error.message
      }
      toast.error(message)
    } finally {
      setIsLoading(false)
      onLoadingChange?.(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
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
          {t('signInButton')}
        </Button>
      </form>
    </Form>
  )
}
