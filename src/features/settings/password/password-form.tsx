import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { ApiError } from '@/lib/http/api-error'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

function createPasswordFormSchema(t: (key: string) => string) {
  return z
    .object({
      oldPassword: z.string().min(1, t('password.validation.currentRequired')),
      newPassword: z
        .string()
        .min(8, t('password.validation.newMin'))
        .max(128, t('password.validation.newMax')),
      confirmPassword: z
        .string()
        .min(1, t('password.validation.confirmRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('password.validation.mismatch'),
      path: ['confirmPassword'],
    })
}

type PasswordFormValues = z.infer<ReturnType<typeof createPasswordFormSchema>>

export function PasswordForm() {
  const { t } = useTranslation('settings')
  const passwordFormSchema = useMemo(() => createPasswordFormSchema(t), [t])

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    try {
      await authApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      form.reset()
      toast.success(t('password.success'))
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('password.failed')
      toast.error(message)
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='oldPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password.current')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('password.currentPlaceholder')}
                  autoComplete='current-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password.new')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('password.newPlaceholder')}
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormDescription>{t('password.newDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password.confirm')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('password.confirmPlaceholder')}
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='animate-spin' />}
          {t('password.update')}
        </Button>
      </form>
    </Form>
  )
}
