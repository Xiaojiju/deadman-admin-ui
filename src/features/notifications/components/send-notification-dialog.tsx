import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { departmentsApi } from '@/api/departments'
import { notificationsApi } from '@/api/notifications'
import { positionsApi } from '@/api/positions'
import { usersApi } from '@/api/users'
import { flattenDepartments } from '@/features/organization/utils/department-options'
import { ApiError } from '@/lib/http/api-error'
import { resolveFileAccessUrl } from '@/lib/files/resolve-file-url'
import { getDisplayNameInitials } from '@/lib/utils'
import { type UserAdminSummaryVO } from '@/types/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NOTIFICATION_QUERY_KEYS } from '@/constants/notification-query-keys'

type SendNotificationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TargetTypeValue = '1' | '2' | '3' | '4'

function formatUserOrg(user: UserAdminSummaryVO) {
  return {
    department: user.department?.name ?? '—',
    positions:
      user.positions.length > 0
        ? user.positions.map((p) => p.name).join('、')
        : '—',
  }
}

function UserPickerOption({
  user,
  selected,
  onToggle,
}: {
  user: UserAdminSummaryVO
  selected: boolean
  onToggle: (user: UserAdminSummaryVO) => void
}) {
  const displayName = user.nickname || user.username
  const org = formatUserOrg(user)

  return (
    <CommandItem
      value={`${displayName} ${user.username} ${org.department} ${org.positions}`}
      onSelect={() => onToggle(user)}
      className='flex items-center gap-3 py-2.5'
    >
      <Avatar className='size-10 shrink-0'>
        <AvatarImage
          src={resolveFileAccessUrl(user.avatar)}
          alt={displayName}
        />
        <AvatarFallback>{getDisplayNameInitials(displayName)}</AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <div className='flex min-w-0 items-center gap-1.5 truncate text-sm'>
          <span className='shrink-0 font-medium'>{displayName}</span>
          {org.department !== '—' ? (
            <>
              <span className='text-muted-foreground'>·</span>
              <span className='truncate text-muted-foreground'>
                {org.department}
              </span>
            </>
          ) : null}
          {org.positions !== '—' ? (
            <>
              <span className='text-muted-foreground'>·</span>
              <span className='truncate text-muted-foreground'>
                {org.positions}
              </span>
            </>
          ) : null}
        </div>
        <p className='truncate text-xs text-muted-foreground'>
          {user.username}
        </p>
      </div>
      {selected ? <Check className='size-4 shrink-0' /> : null}
    </CommandItem>
  )
}

export function SendNotificationDialog({
  open,
  onOpenChange,
}: SendNotificationDialogProps) {
  const { t } = useTranslation(['notification', 'common', 'system'])
  const queryClient = useQueryClient()
  const [userKeyword, setUserKeyword] = useState('')
  const [selectedUsersMap, setSelectedUsersMap] = useState<
    Record<string, UserAdminSummaryVO>
  >({})

  const formSchema = useMemo(
    () =>
      z
        .object({
          title: z.string().min(1, t('notification:send.validation.titleRequired')),
          content: z
            .string()
            .min(1, t('notification:send.validation.contentRequired')),
          targetType: z.enum(['1', '2', '3', '4']),
          userIds: z.array(z.string()).optional(),
          departmentIds: z.array(z.string()).optional(),
          positionIds: z.array(z.string()).optional(),
        })
        .superRefine((values, ctx) => {
          if (values.targetType === '1' && !values.userIds?.length) {
            ctx.addIssue({
              code: 'custom',
              message: t('notification:send.validation.usersRequired'),
              path: ['userIds'],
            })
          }
          if (values.targetType === '2' && !values.departmentIds?.length) {
            ctx.addIssue({
              code: 'custom',
              message: t('notification:send.validation.departmentsRequired'),
              path: ['departmentIds'],
            })
          }
          if (values.targetType === '3' && !values.positionIds?.length) {
            ctx.addIssue({
              code: 'custom',
              message: t('notification:send.validation.positionsRequired'),
              path: ['positionIds'],
            })
          }
        }),
    [t]
  )

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      targetType: '1',
      userIds: [],
      departmentIds: [],
      positionIds: [],
    },
  })

  const targetType = useWatch({
    control: form.control,
    name: 'targetType',
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setUserKeyword('')
      setSelectedUsersMap({})
    }
  }, [open, form])

  const { data: usersData, isFetching: usersLoading } = useQuery({
    queryKey: ['notification-send-users', userKeyword],
    queryFn: () =>
      usersApi.page({
        current: 1,
        size: 100,
        keyword: userKeyword || undefined,
        status: 1,
      }),
    enabled: open && targetType === '1',
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['notification-send-departments'],
    queryFn: () => departmentsApi.list(),
    enabled: open && targetType === '2',
  })

  const { data: positions = [] } = useQuery({
    queryKey: ['notification-send-positions'],
    queryFn: () => positionsApi.list(),
    enabled: open && targetType === '3',
  })

  const departmentOptions = useMemo(
    () => flattenDepartments(departments),
    [departments]
  )

  const sendMutation = useMutation({
    mutationFn: notificationsApi.send,
    onSuccess: (result) => {
      toast.success(
        t('notification:send.toast.success', {
          count: result.recipientCount,
        })
      )
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.sent],
      })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t('notification:send.toast.failed')
      )
    },
  })

  const onSubmit = (values: FormValues) => {
    sendMutation.mutate({
      title: values.title,
      content: values.content,
      targetType: Number(values.targetType) as 1 | 2 | 3 | 4,
      userIds: values.targetType === '1' ? values.userIds : undefined,
      departmentIds:
        values.targetType === '2' ? values.departmentIds : undefined,
      positionIds: values.targetType === '3' ? values.positionIds : undefined,
    })
  }

  const selectedUserIds = useWatch({
    control: form.control,
    name: 'userIds',
    defaultValue: [],
  }) ?? []

  const toggleUser = (user: UserAdminSummaryVO) => {
    const current = form.getValues('userIds') ?? []
    if (current.includes(user.id)) {
      form.setValue(
        'userIds',
        current.filter((id) => id !== user.id),
        { shouldValidate: true }
      )
      setSelectedUsersMap((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
      return
    }

    form.setValue('userIds', [...current, user.id], { shouldValidate: true })
    setSelectedUsersMap((prev) => ({ ...prev, [user.id]: user }))
  }

  const toggleId = (
    field: 'departmentIds' | 'positionIds',
    id: string,
    checked: boolean
  ) => {
    const current = form.getValues(field) ?? []
    form.setValue(
      field,
      checked ? [...current, id] : current.filter((item) => item !== id),
      { shouldValidate: true }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl'>
        <DialogHeader className='shrink-0'>
          <DialogTitle>{t('notification:send.title')}</DialogTitle>
          <DialogDescription>{t('notification:send.desc')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex min-h-0 flex-1 flex-col overflow-hidden'
          >
            <ScrollArea className='min-h-0 flex-1 pe-3'>
              <div className='space-y-4 px-1 py-0.5'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('notification:send.fields.title')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('notification:send.fields.content')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={8}
                          className='field-sizing-fixed max-h-60 min-h-40 resize-y overflow-y-auto'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='targetType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('notification:send.fields.targetType')}
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value: TargetTypeValue) => {
                          field.onChange(value)
                          form.setValue('userIds', [])
                          form.setValue('departmentIds', [])
                          form.setValue('positionIds', [])
                          setSelectedUsersMap({})
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='1'>
                            {t('notification:send.targetTypes.user')}
                          </SelectItem>
                          <SelectItem value='2'>
                            {t('notification:send.targetTypes.department')}
                          </SelectItem>
                          <SelectItem value='3'>
                            {t('notification:send.targetTypes.position')}
                          </SelectItem>
                          <SelectItem value='4'>
                            {t('notification:send.targetTypes.all')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {targetType === '1' ? (
                  <FormField
                    control={form.control}
                    name='userIds'
                    render={() => (
                      <FormItem>
                        <FormLabel>{t('notification:send.fields.users')}</FormLabel>
                        {selectedUserIds.length > 0 ? (
                          <div className='mb-3 flex flex-wrap gap-2'>
                            {selectedUserIds
                              .map((id) => selectedUsersMap[id])
                              .filter(Boolean)
                              .map((user) => (
                                <Badge
                                  key={user.id}
                                  variant='secondary'
                                  className='flex items-center gap-1.5 py-1 ps-1 pe-2'
                                >
                                  <Avatar className='size-5'>
                                    <AvatarImage
                                      src={resolveFileAccessUrl(user.avatar)}
                                      alt={user.nickname || user.username}
                                    />
                                    <AvatarFallback className='text-[10px]'>
                                      {getDisplayNameInitials(
                                        user.nickname || user.username
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.nickname || user.username}
                                  <button
                                    type='button'
                                    className='ms-0.5'
                                    onClick={() => toggleUser(user)}
                                  >
                                    <X className='size-3' />
                                  </button>
                                </Badge>
                              ))}
                          </div>
                        ) : null}
                        <Command className='rounded-lg border'>
                          <CommandInput
                            placeholder={t('notification:send.searchUsers')}
                            value={userKeyword}
                            onValueChange={setUserKeyword}
                            className='h-11'
                          />
                          <CommandList className='max-h-80'>
                            <CommandEmpty>
                              {usersLoading
                                ? t('common:loading')
                                : t('common:noResults')}
                            </CommandEmpty>
                            <CommandGroup>
                              {(usersData?.records ?? []).map((user) => (
                                <UserPickerOption
                                  key={user.id}
                                  user={user}
                                  selected={selectedUserIds.includes(user.id)}
                                  onToggle={toggleUser}
                                />
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {targetType === '2' ? (
                  <FormField
                    control={form.control}
                    name='departmentIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('notification:send.fields.departments')}
                        </FormLabel>
                        <ScrollArea className='h-56 rounded-md border p-3'>
                          <div className='space-y-2'>
                            {departmentOptions.map((dept) => (
                              <label
                                key={dept.id}
                                className='flex items-center gap-2 text-sm'
                                style={{
                                  paddingInlineStart: `${dept.depth * 12}px`,
                                }}
                              >
                                <Checkbox
                                  checked={field.value?.includes(dept.id)}
                                  onCheckedChange={(checked) =>
                                    toggleId(
                                      'departmentIds',
                                      dept.id,
                                      checked === true
                                    )
                                  }
                                />
                                {dept.label}
                              </label>
                            ))}
                          </div>
                        </ScrollArea>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {targetType === '3' ? (
                  <FormField
                    control={form.control}
                    name='positionIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('notification:send.fields.positions')}
                        </FormLabel>
                        <ScrollArea className='h-56 rounded-md border p-3'>
                          <div className='space-y-2'>
                            {positions.map((position) => (
                              <label
                                key={position.id}
                                className='flex items-center gap-2 text-sm'
                              >
                                <Checkbox
                                  checked={field.value?.includes(position.id)}
                                  onCheckedChange={(checked) =>
                                    toggleId(
                                      'positionIds',
                                      position.id,
                                      checked === true
                                    )
                                  }
                                />
                                {position.positionName}
                              </label>
                            ))}
                          </div>
                        </ScrollArea>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {targetType === '4' ? (
                  <FormDescription>
                    {t('notification:send.targetAllHint')}
                  </FormDescription>
                ) : null}
              </div>
            </ScrollArea>

            <DialogFooter className='shrink-0 border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                {t('common:cancel')}
              </Button>
              <Button type='submit' disabled={sendMutation.isPending}>
                {sendMutation.isPending ? (
                  <Loader2 className='me-2 size-4 animate-spin' />
                ) : null}
                {t('notification:send.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
