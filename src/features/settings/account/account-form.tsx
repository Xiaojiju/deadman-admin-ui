import { useMemo } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type UserAccountBindingVO } from '@/types/api'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth-store'
import { ApiError } from '@/lib/http/api-error'
import { resolveFileAccessUrl } from '@/lib/files/resolve-file-url'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/use-permission'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/components/permission'
import { AvatarUploadField } from '@/components/avatar-upload-field'

function createEditSchema(t: (key: string) => string) {
  return z.object({
    nickname: z
      .string()
      .min(1, t('account.validation.nicknameRequired'))
      .max(64),
    avatar: z.string().max(512).optional(),
  })
}

type AccountEditValues = z.infer<ReturnType<typeof createEditSchema>>

function AccountInfoField({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-2'>
      <Label className='text-muted-foreground'>{label}</Label>
      <div className='text-sm'>{children}</div>
      {description ? (
        <p className='text-sm text-muted-foreground'>{description}</p>
      ) : null}
    </div>
  )
}

function AccountBindingRow({
  account,
  t,
}: {
  account: UserAccountBindingVO
  t: (key: string) => string
}) {
  const typeKey = `account.accountType.${account.accountType}` as const
  const typeLabel = t(typeKey)
  const displayType = typeLabel === typeKey ? account.accountType : typeLabel

  return (
    <TableRow>
      <TableCell>
        <Badge variant='outline'>{displayType}</Badge>
      </TableCell>
      <TableCell className='font-mono text-sm'>
        {account.accountIdentifier}
      </TableCell>
      <TableCell>
        {account.oauthProvider ? (
          <span className='text-sm'>{account.oauthProvider}</span>
        ) : (
          <span className='text-muted-foreground'>-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={account.status === 1 ? 'default' : 'secondary'}>
          {account.status === 1
            ? t('account.accountStatusActive')
            : t('account.accountStatusInactive')}
        </Badge>
      </TableCell>
    </TableRow>
  )
}

export function AccountForm() {
  const { t } = useTranslation('settings')
  const queryClient = useQueryClient()
  const { can } = usePermission()
  const canUpdate = can(PERMISSIONS.USER_PROFILE_UPDATE)
  const roleCodes = useAuthStore((s) => s.auth.roleCodes)
  const setUser = useAuthStore((s) => s.auth.setUser)
  const editSchema = useMemo(() => createEditSchema(t), [t])

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMyProfile(),
  })

  const form = useForm<AccountEditValues>({
    resolver: zodResolver(editSchema),
    values: profile
      ? {
          nickname: profile.nickname,
          avatar: profile.avatar ?? '',
        }
      : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (values: AccountEditValues) =>
      userApi.updateMyProfile({
        nickname: values.nickname,
        avatar: values.avatar?.trim() || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user', 'me'], updated)
      setUser(updated)
      toast.success(t('account.toast.updated'))
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t('account.toast.updateFailed')
      toast.error(message)
    },
  })

  const avatarUpdateMutation = useMutation({
    mutationFn: (accessUrl: string) =>
      userApi.updateMyProfile({
        nickname: form.getValues('nickname'),
        avatar: accessUrl,
      }),
    onSuccess: (updated) => {
      form.setValue('avatar', updated.avatar ?? '')
      queryClient.setQueryData(['user', 'me'], updated)
      setUser(updated)
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : t('account.toast.updateFailed')
      toast.error(message)
      throw error
    },
  })

  const watchedNickname = useWatch({
    control: form.control,
    name: 'nickname',
  })
  const watchedAvatar = useWatch({
    control: form.control,
    name: 'avatar',
  })

  function onSubmit(values: AccountEditValues) {
    updateMutation.mutate(values)
  }

  const isSubmitting = form.formState.isSubmitting || updateMutation.isPending

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-muted-foreground'>
        <Loader2 className='size-4 animate-spin' />
        {t('account.loading')}
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <p className='text-sm text-muted-foreground'>{t('account.loadFailed')}</p>
    )
  }

  const previewNickname = watchedNickname || profile.nickname
  const previewAvatar = resolveFileAccessUrl(watchedAvatar || profile.avatar)
  const initials =
    previewNickname?.slice(0, 2) ||
    profile.username?.slice(0, 2) ||
    profile.userCode.slice(0, 2)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-16 w-16'>
            <AvatarImage
              src={previewAvatar || undefined}
              alt={previewNickname}
            />
            <AvatarFallback className='text-lg'>
              {initials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='text-lg font-medium'>{previewNickname}</p>
            <p className='font-mono text-sm text-muted-foreground'>
              {profile.userCode}
            </p>
            {profile.username ? (
              <p className='text-sm text-muted-foreground'>
                {profile.username}
              </p>
            ) : null}
          </div>
        </div>

        <div className='grid max-w-lg gap-6'>
          <FormField
            control={form.control}
            name='nickname'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('account.nickname')}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!canUpdate || isSubmitting} />
                </FormControl>
                <FormDescription>{t('account.nicknameDesc')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='avatar'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('account.avatar')}</FormLabel>
                <FormControl>
                  <AvatarUploadField
                    value={field.value}
                    displayName={previewNickname}
                    disabled={!canUpdate || isSubmitting || avatarUpdateMutation.isPending}
                    onUploaded={async (accessUrl) => {
                      await avatarUpdateMutation.mutateAsync(accessUrl)
                    }}
                  />
                </FormControl>
                <FormDescription>{t('account.avatarDesc')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <PermissionGate permission={PERMISSIONS.USER_PROFILE_UPDATE}>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='me-2 h-4 w-4 animate-spin' />
                  {t('account.saving')}
                </>
              ) : (
                t('account.save')
              )}
            </Button>
          </PermissionGate>
        </div>

        <Separator />

        <div className='grid max-w-2xl gap-6'>
          <AccountInfoField
            label={t('account.userCode')}
            description={t('account.userCodeDesc')}
          >
            <span className='font-mono'>{profile.userCode}</span>
          </AccountInfoField>

          {profile.username ? (
            <AccountInfoField
              label={t('account.username')}
              description={t('account.usernameDesc')}
            >
              <span className='font-mono'>{profile.username}</span>
            </AccountInfoField>
          ) : null}

          <AccountInfoField label={t('account.status')}>
            <Badge variant={profile.status === 1 ? 'default' : 'secondary'}>
              {profile.status === 1
                ? t('account.statusActive')
                : t('account.statusInactive')}
            </Badge>
          </AccountInfoField>

          <AccountInfoField label={t('account.createdAt')}>
            {profile.createTime
              ? format(new Date(profile.createTime), 'PPpp')
              : '-'}
          </AccountInfoField>

          <div className='space-y-3'>
            <div>
              <Label className='text-muted-foreground'>
                {t('account.accounts')}
              </Label>
              <p className='mt-1 text-sm text-muted-foreground'>
                {t('account.accountsDesc')}
              </p>
            </div>
            {profile.accounts.length > 0 ? (
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('account.accountTypeLabel')}</TableHead>
                      <TableHead>{t('account.accountIdentifier')}</TableHead>
                      <TableHead>{t('account.oauthProvider')}</TableHead>
                      <TableHead>{t('account.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.accounts.map((account) => (
                      <AccountBindingRow
                        key={`${account.accountType}-${account.accountIdentifier}`}
                        account={account}
                        t={t}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>
                {t('account.noAccounts')}
              </p>
            )}
          </div>

          <AccountInfoField
            label={t('account.roles')}
            description={t('account.rolesDesc')}
          >
            {roleCodes.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {roleCodes.map((code) => (
                  <Badge key={code} variant='secondary' className='font-mono'>
                    {code}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className='text-muted-foreground'>
                {t('account.noRoles')}
              </span>
            )}
          </AccountInfoField>
        </div>
      </form>
    </Form>
  )
}
