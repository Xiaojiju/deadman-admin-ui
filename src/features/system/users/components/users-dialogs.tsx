import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { rolesApi } from '@/api/system'
import { usersApi } from '@/api/users'
import { type RoleSummaryVO } from '@/types/api'
import { ApiError } from '@/lib/http/api-error'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { AvatarUploadField } from '@/components/avatar-upload-field'
import { PasswordInput } from '@/components/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isSuperAdminUser } from '../utils'
import { useUsers } from './users-provider'
import { UserOrgFormFields } from './user-org-fields'

const phoneSchema = (message: string) =>
  z.union([z.literal(''), z.string().regex(/^1[3-9]\d{9}$/, message)])

function createCreateSchema(t: (key: string) => string) {
  return z.object({
    username: z.string().min(3).max(64),
    password: z.string().min(8).max(128),
    nickname: z.string().max(64).optional(),
    avatar: z.string().max(512).optional(),
    phone: phoneSchema(t('system:users.validation.phoneInvalid')).optional(),
    departmentId: z.string().nullable(),
    positionIds: z.array(z.string()).optional(),
  })
}

function createEditSchema(t: (key: string) => string) {
  return z.object({
    nickname: z.string().max(64).optional(),
    avatar: z.string().max(512).optional(),
    status: z.number().int(),
    phone: phoneSchema(t('system:users.validation.phoneInvalid')).optional(),
    departmentId: z.string().nullable(),
    positionIds: z.array(z.string()),
  })
}

function createResetPasswordSchema(
  passwordMismatchMessage: string
) {
  return z
    .object({
      newPassword: z.string().min(8).max(128),
      confirmPassword: z.string().min(8).max(128),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: passwordMismatchMessage,
      path: ['confirmPassword'],
    })
}

type AssignRolesDialogContentProps = {
  roles: RoleSummaryVO[]
  initialRoleIds: string[]
  isPending: boolean
  saveLabel: string
  onSave: (roleIds: string[]) => void
}

function AssignRolesDialogContent({
  roles,
  initialRoleIds,
  isPending,
  saveLabel,
  onSave,
}: AssignRolesDialogContentProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState(initialRoleIds)

  return (
    <>
      <ScrollArea className='h-72 rounded-md border p-3'>
        <div className='space-y-2'>
          {roles.map((role) => (
            <label key={role.id} className='flex items-center gap-2 text-sm'>
              <Checkbox
                checked={selectedRoleIds.includes(role.id)}
                onCheckedChange={(checked) => {
                  setSelectedRoleIds((prev) =>
                    checked === true
                      ? [...prev, role.id]
                      : prev.filter((id) => id !== role.id)
                  )
                }}
              />
              <span>{role.roleName}</span>
              <span className='font-mono text-xs text-muted-foreground'>
                {role.roleCode}
              </span>
            </label>
          ))}
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button onClick={() => onSave(selectedRoleIds)} disabled={isPending}>
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  )
}

export function UsersDialogs() {
  const { t } = useTranslation(['system', 'common'])
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  const queryClient = useQueryClient()
  const createSchema = useMemo(() => createCreateSchema(t), [t])
  const editSchema = useMemo(() => createEditSchema(t), [t])
  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(t('system:users.validation.passwordMismatch')),
    [t]
  )

  const { data: userDetail } = useQuery({
    queryKey: ['users', currentRow?.id],
    queryFn: () => usersApi.getById(currentRow!.id),
    enabled: !!currentRow && (open === 'edit' || open === 'roles'),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
    enabled: open === 'roles',
  })

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      username: '',
      password: '',
      nickname: '',
      avatar: '',
      phone: '',
      departmentId: null,
      positionIds: [],
    },
  })

  const superAdmin = currentRow ? isSuperAdminUser(currentRow) : false

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: userDetail
      ? {
          nickname: userDetail.nickname ?? '',
          avatar: userDetail.avatar ?? '',
          status: userDetail.status,
          phone: userDetail.phone ?? '',
          departmentId: userDetail.department?.id ?? null,
          positionIds: userDetail.positions.map((p) => p.id),
        }
      : undefined,
  })

  const initialRoleIds = useMemo(() => {
    if (!userDetail) return []
    return roles
      .filter((role) => userDetail.roleCodes.includes(role.roleCode))
      .map((role) => role.id)
  }, [userDetail, roles])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['users'] })

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof createSchema>) => {
      const payload: Parameters<typeof usersApi.create>[0] = {
        username: values.username,
        password: values.password,
        nickname: values.nickname || undefined,
        avatar: values.avatar || undefined,
        phone: values.phone || undefined,
        departmentId: values.departmentId ?? undefined,
        positionIds:
          values.positionIds && values.positionIds.length > 0
            ? values.positionIds
            : undefined,
      }
      return usersApi.create(payload)
    },
    onSuccess: () => {
      invalidate()
      setOpen(null)
      createForm.reset()
      toast.success(t('system:users.toast.created'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('system:users.toast.createFailed')
      ),
  })

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof editSchema>) =>
      usersApi.update(currentRow!.id, {
        nickname: values.nickname || undefined,
        avatar: values.avatar || undefined,
        status: values.status,
        phone: values.phone || undefined,
        departmentId: values.departmentId,
        positionIds: values.positionIds,
      }),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('system:users.toast.updated'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('system:users.toast.updateFailed')
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.remove(currentRow!.id),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('system:users.toast.deleted'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('system:users.toast.deleteFailed')
      ),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (values: z.infer<typeof resetPasswordSchema>) =>
      usersApi.resetPassword(currentRow!.id, {
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      setOpen(null)
      setCurrentRow(null)
      resetPasswordForm.reset()
      toast.success(t('system:users.toast.passwordReset'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError
          ? e.message
          : t('system:users.toast.passwordResetFailed')
      ),
  })

  const assignRolesMutation = useMutation({
    mutationFn: (roleIds: string[]) =>
      usersApi.assignRoles(currentRow!.id, { roleIds }),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('system:users.toast.rolesAssigned'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError
          ? e.message
          : t('system:users.toast.assignRolesFailed')
      ),
  })

  const createNickname = useWatch({
    control: createForm.control,
    name: 'nickname',
  })
  const createUsername = useWatch({
    control: createForm.control,
    name: 'username',
  })
  const createDisplayName =
    createNickname?.trim() || createUsername?.trim() || '?'

  const editNickname = useWatch({
    control: editForm.control,
    name: 'nickname',
  })
  const editDisplayName =
    editNickname?.trim() ||
    currentRow?.nickname ||
    currentRow?.username ||
    '?'

  return (
    <>
      <Dialog open={open === 'create'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('system:users.dialogs.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:users.dialogs.createDesc')}
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className='space-y-4'
              onSubmit={createForm.handleSubmit((values) =>
                createMutation.mutate(values)
              )}
            >
              <FormField
                control={createForm.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.username')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('system:users.dialogs.usernamePlaceholder')}
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.password')}</FormLabel>
                    <FormControl>
                      <Input type='password' autoComplete='new-password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='nickname'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.nickname')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.avatar')}</FormLabel>
                    <FormControl>
                      <AvatarUploadField
                        value={field.value}
                        displayName={createDisplayName}
                        disabled={createMutation.isPending}
                        i18nNamespace='system'
                        i18nKeyPrefix='users.dialogs.avatarUpload'
                        onUploaded={(accessUrl) => {
                          field.onChange(accessUrl)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('system:users.dialogs.avatarDesc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.phone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('system:users.dialogs.phonePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <UserOrgFormFields form={createForm} t={t} />
              <DialogFooter>
                <Button type='submit' disabled={createMutation.isPending}>
                  {t('common:create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'edit'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('system:users.dialogs.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:users.dialogs.editDesc', {
                username: currentRow?.username ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className='space-y-4'
              onSubmit={editForm.handleSubmit((values) =>
                updateMutation.mutate(values)
              )}
            >
              <FormField
                control={editForm.control}
                name='nickname'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.nickname')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.avatar')}</FormLabel>
                    <FormControl>
                      <AvatarUploadField
                        value={field.value}
                        displayName={editDisplayName}
                        disabled={updateMutation.isPending}
                        i18nNamespace='system'
                        i18nKeyPrefix='users.dialogs.avatarUpload'
                        onUploaded={(accessUrl) => {
                          field.onChange(accessUrl)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('system:users.dialogs.avatarDesc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.dialogs.phone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('system:users.dialogs.phonePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <UserOrgFormFields form={editForm} t={t} />
              <FormField
                control={editForm.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:users.columns.status')}</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={superAdmin}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='1'>
                          {t('system:users.columns.active')}
                        </SelectItem>
                        <SelectItem value='0'>
                          {t('system:users.columns.inactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {superAdmin ? (
                      <p className='text-xs text-muted-foreground'>
                        {t('system:users.dialogs.superAdminStatusHint')}
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type='submit' disabled={updateMutation.isPending}>
                  {t('common:save')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'roles'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('system:users.dialogs.assignRolesTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:users.dialogs.assignRolesDesc', {
                name: currentRow?.nickname || currentRow?.username || '',
              })}
            </DialogDescription>
          </DialogHeader>
          {userDetail ? (
            <AssignRolesDialogContent
              key={userDetail.id}
              roles={roles}
              initialRoleIds={initialRoleIds}
              isPending={assignRolesMutation.isPending}
              saveLabel={t('system:users.dialogs.saveRoles')}
              onSave={(roleIds) => assignRolesMutation.mutate(roleIds)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={open === 'resetPassword'}
        onOpenChange={() => setOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('system:users.dialogs.resetPasswordTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('system:users.dialogs.resetPasswordDesc', {
                name: currentRow?.nickname || currentRow?.username || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordForm} key={currentRow?.id ?? 'reset-password'}>
            <form
              className='space-y-4'
              onSubmit={resetPasswordForm.handleSubmit((values) =>
                resetPasswordMutation.mutate(values)
              )}
            >
              <FormField
                control={resetPasswordForm.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('system:users.dialogs.newPassword')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete='new-password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetPasswordForm.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('system:users.dialogs.confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete='new-password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='submit'
                  disabled={resetPasswordMutation.isPending}
                >
                  {t('system:users.dialogs.resetPasswordSubmit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('system:users.dialogs.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:users.dialogs.deleteDesc', {
                name: currentRow?.nickname || currentRow?.username || '',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(null)}>
              {t('common:cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {t('common:delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
