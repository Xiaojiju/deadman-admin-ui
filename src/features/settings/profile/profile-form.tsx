import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { userApi } from '@/api/user'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function createProfileFormSchema(t: (key: string) => string) {
  return z.object({
    userCode: z.string(),
    nickname: z.string().min(1, t('profile.validation.nicknameRequired')),
    bio: z.string().max(160).min(4).optional().or(z.literal('')),
    email: z.string().optional(),
    urls: z.array(z.object({ value: z.string() })).optional(),
  })
}

type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>

export function ProfileForm() {
  const { t } = useTranslation('settings')
  const formSchema = useMemo(() => createProfileFormSchema(t), [t])

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMyProfile(),
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    values: profile
      ? {
          userCode: profile.userCode,
          nickname: profile.nickname,
          bio: 'I own a computer.',
          email: '',
          urls: [{ value: 'https://shadcn.com' }],
        }
      : undefined,
  })

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Loader2 className='size-4 animate-spin' />
        {t('profile.loading')}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='userCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.userCode')}</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormDescription>{t('profile.userCodeDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='nickname'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.nickname')}</FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormDescription>{t('profile.nicknameDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.email')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.emailPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='m@example.com'>m@example.com</SelectItem>
                  <SelectItem value='m@google.com'>m@google.com</SelectItem>
                  <SelectItem value='m@support.com'>m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{t('profile.emailDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('profile.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('profile.bioPlaceholder')}
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>{t('profile.bioDesc')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {(form.watch('urls') ?? []).map((_, index) => (
            <FormField
              control={form.control}
              key={index}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    {t('profile.urls')}
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    {t('profile.urlsDesc')}
                  </FormDescription>
                  <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button type='submit'>{t('profile.updateProfile')}</Button>
      </form>
    </Form>
  )
}
