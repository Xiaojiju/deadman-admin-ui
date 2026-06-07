import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { permissionsApi, rolesApi } from '@/api/system'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useRoles } from './roles-provider'

function createCreateSchema(t: (key: string) => string) {
  return z.object({
    roleCode: z
      .string()
      .regex(/^[A-Z][A-Z0-9_]{1,63}$/, t('system:roles.validation.roleCodeInvalid')),
    roleName: z.string().min(1).max(64),
    description: z.string().max(256).optional(),
    permissionCodes: z.array(z.string()).optional(),
  })
}

const editSchema = z.object({
  roleName: z.string().min(1).max(64),
  description: z.string().max(256).optional(),
  status: z.number().int(),
})

export function RolesDialogs() {
  const { t } = useTranslation(['system', 'common'])
  const { open, setOpen, currentRow, setCurrentRow } = useRoles()
  const queryClient = useQueryClient()
  const createSchema = useMemo(() => createCreateSchema(t), [t])

  const { data: catalog = [] } = useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => permissionsApi.catalog(),
    enabled: open === 'create' || open === 'permissions',
  })

  const { data: roleDetail } = useQuery({
    queryKey: ['roles', currentRow?.id],
    queryFn: () => rolesApi.getById(currentRow!.id),
    enabled: !!currentRow && (open === 'edit' || open === 'permissions'),
  })

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      roleCode: '',
      roleName: '',
      description: '',
      permissionCodes: [],
    },
  })

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: roleDetail
      ? {
          roleName: roleDetail.roleName,
          description: roleDetail.description ?? '',
          status: roleDetail.status,
        }
      : undefined,
  })

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  useEffect(() => {
    if (open === 'permissions' && roleDetail) {
      setSelectedPermissions(roleDetail.permissionCodes)
    }
  }, [open, roleDetail])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['roles'] })

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      invalidate()
      setOpen(null)
      createForm.reset()
      toast.success(t('system:roles.toast.created'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('system:roles.toast.createFailed')
      ),
  })

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof editSchema>) =>
      rolesApi.update(currentRow!.id, values),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('system:roles.toast.updated'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('system:roles.toast.updateFailed')
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: () => rolesApi.remove(currentRow!.id),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('system:roles.toast.deleted'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('system:roles.toast.deleteFailed')
      ),
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      rolesApi.assignPermissions(currentRow!.id, {
        permissionCodes: selectedPermissions,
      }),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('system:roles.toast.permissionsAssigned'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError
          ? e.message
          : t('system:roles.toast.assignFailed')
      ),
  })

  function togglePermission(code: string, checked: boolean) {
    setSelectedPermissions((prev) =>
      checked ? [...prev, code] : prev.filter((c) => c !== code)
    )
  }

  return (
    <>
      <Dialog open={open === 'create'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('system:roles.dialogs.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:roles.dialogs.createDesc')}
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
                name='roleCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:roles.dialogs.roleCode')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('system:roles.dialogs.roleCodePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='roleName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:roles.dialogs.roleName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('system:roles.dialogs.roleNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('system:roles.dialogs.description')}
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='permissionCodes'
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {t('system:roles.dialogs.permissions')}
                    </FormLabel>
                    <ScrollArea className='h-40 rounded-md border p-3'>
                      {catalog.map((group) => (
                        <div key={group.code} className='mb-3'>
                          <p className='mb-1 text-sm font-medium'>
                            {group.label}
                          </p>
                          <div className='space-y-2'>
                            {group.permissions.map((perm) => (
                              <label
                                key={perm.code}
                                className='flex items-center gap-2 text-sm'
                              >
                                <Checkbox
                                  checked={createForm
                                    .watch('permissionCodes')
                                    ?.includes(perm.code)}
                                  onCheckedChange={(checked) => {
                                    const current =
                                      createForm.getValues('permissionCodes') ??
                                      []
                                    createForm.setValue(
                                      'permissionCodes',
                                      checked
                                        ? [...current, perm.code]
                                        : current.filter((c) => c !== perm.code)
                                    )
                                  }}
                                />
                                <span>{perm.label}</span>
                                <span className='font-mono text-xs text-muted-foreground'>
                                  {perm.code}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </FormItem>
                )}
              />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('system:roles.dialogs.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:roles.dialogs.editDesc', {
                code: currentRow?.roleCode ?? '',
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
                name='roleName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:roles.dialogs.roleName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('system:roles.dialogs.description')}
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('system:roles.columns.status')}</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
                    </FormControl>
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

      <Dialog open={open === 'permissions'} onOpenChange={() => setOpen(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('system:roles.dialogs.assignTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:roles.dialogs.assignDesc', {
                name: currentRow?.roleName ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='h-72 rounded-md border p-3'>
            {catalog.map((group) => (
              <div key={group.code} className='mb-3'>
                <p className='mb-1 text-sm font-medium'>{group.label}</p>
                <div className='space-y-2'>
                  {group.permissions.map((perm) => (
                    <label
                      key={perm.code}
                      className='flex items-center gap-2 text-sm'
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(perm.code)}
                        onCheckedChange={(checked) =>
                          togglePermission(perm.code, checked === true)
                        }
                      />
                      <span>{perm.label}</span>
                      <span className='font-mono text-xs text-muted-foreground'>
                        {perm.code}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
          <DialogFooter>
            <Button
              onClick={() => assignMutation.mutate()}
              disabled={assignMutation.isPending}
            >
              {t('system:roles.dialogs.savePermissions')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('system:roles.dialogs.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('system:roles.dialogs.deleteDesc', {
                name: currentRow?.roleName ?? '',
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
