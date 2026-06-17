import { useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type DepartmentVO } from '@/types/api'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { departmentsApi } from '@/api/departments'
import { ApiError } from '@/lib/http/api-error'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDepartments } from './departments-provider'

function createCreateSchema(t: (key: string) => string) {
  return z.object({
    parentId: z.string().nullable(),
    deptCode: z
      .string()
      .regex(
        /^[A-Z][A-Z0-9_]{1,63}$/,
        t('department:validation.deptCodeInvalid')
      ),
    deptName: z.string().min(1).max(128),
    sortOrder: z.number().int().optional(),
  })
}

const editSchema = z.object({
  parentId: z.string().nullable(),
  deptName: z.string().min(1).max(128),
  sortOrder: z.number().int().optional(),
  status: z.number().int(),
})

function flattenDepartments(
  flatList: DepartmentVO[],
  excludeId?: string
): { id: string; label: string; depth: number }[] {
  const excludeIds = new Set<string>()
  if (excludeId) {
    const byParent = new Map<string | null, DepartmentVO[]>()
    for (const d of flatList) {
      const key = d.parentId
      if (!byParent.has(key)) byParent.set(key, [])
      byParent.get(key)!.push(d)
    }
    function collectDescendants(id: string) {
      excludeIds.add(id)
      for (const child of byParent.get(id) ?? []) {
        collectDescendants(child.id)
      }
    }
    collectDescendants(excludeId)
  }

  const nodes = flatList.filter((d) => !excludeIds.has(d.id))
  const byParent = new Map<string | null, DepartmentVO[]>()
  for (const d of nodes) {
    const key = d.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(d)
  }

  function walk(
    parentId: string | null,
    depth: number
  ): { id: string; label: string; depth: number }[] {
    const children = byParent.get(parentId) ?? []
    children.sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.deptCode.localeCompare(b.deptCode)
    )
    const result: { id: string; label: string; depth: number }[] = []
    for (const node of children) {
      result.push({ id: node.id, label: node.deptName, depth })
      result.push(...walk(node.id, depth + 1))
    }
    return result
  }

  return walk(null, 0)
}

export function DepartmentsDialogs() {
  const { t } = useTranslation(['department', 'common'])
  const {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    defaultParentId,
    setDefaultParentId,
  } = useDepartments()
  const queryClient = useQueryClient()
  const createSchema = useMemo(() => createCreateSchema(t), [t])

  const isCreateOpen = open === 'create' || open === 'createChild'

  const { data: flatList = [] } = useQuery({
    queryKey: ['departments', 'list'],
    queryFn: () => departmentsApi.list(),
    enabled: isCreateOpen || open === 'edit',
  })

  const { data: departmentDetail } = useQuery({
    queryKey: ['departments', currentRow?.id],
    queryFn: () => departmentsApi.getById(currentRow!.id),
    enabled: !!currentRow && open === 'edit',
  })

  const parentOptions = useMemo(
    () => flattenDepartments(flatList, currentRow?.id),
    [flatList, currentRow?.id]
  )

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      parentId: null,
      deptCode: '',
      deptName: '',
      sortOrder: 0,
    },
  })

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: departmentDetail
      ? {
          parentId: departmentDetail.parentId,
          deptName: departmentDetail.deptName,
          sortOrder: departmentDetail.sortOrder,
          status: departmentDetail.status,
        }
      : undefined,
  })

  useEffect(() => {
    if (open === 'create') {
      createForm.reset({
        parentId: defaultParentId,
        deptCode: '',
        deptName: '',
        sortOrder: 0,
      })
    }
    if (open === 'createChild') {
      createForm.reset({
        parentId: defaultParentId ?? currentRow?.id ?? null,
        deptCode: '',
        deptName: '',
        sortOrder: 0,
      })
    }
  }, [open, defaultParentId, currentRow, createForm])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['departments'] })
  }

  const createMutation = useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      setDefaultParentId(null)
      createForm.reset()
      toast.success(t('department:toast.created'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('department:toast.createFailed')
      ),
  })

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof editSchema>) =>
      departmentsApi.update(currentRow!.id, values),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('department:toast.updated'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('department:toast.updateFailed')
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: () => departmentsApi.remove(currentRow!.id),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('department:toast.deleted'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('department:toast.deleteFailed')
      ),
  })

  function handleCreateSubmit(values: z.infer<typeof createSchema>) {
    createMutation.mutate({
      parentId: values.parentId,
      deptCode: values.deptCode,
      deptName: values.deptName,
      sortOrder: values.sortOrder,
    })
  }

  return (
    <>
      <Dialog
        open={isCreateOpen}
        onOpenChange={() => {
          setOpen(null)
          setDefaultParentId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {open === 'createChild'
                ? t('department:dialogs.createChildTitle')
                : t('department:dialogs.createTitle')}
            </DialogTitle>
            <DialogDescription>
              {open === 'createChild'
                ? t('department:dialogs.createChildDesc', {
                    name: currentRow?.deptName ?? '',
                  })
                : t('department:dialogs.createDesc')}
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className='space-y-4'
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            >
              <FormField
                control={createForm.control}
                name='parentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.parent')}</FormLabel>
                    <Select
                      value={field.value ?? 'root'}
                      onValueChange={(v) =>
                        field.onChange(v === 'root' ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='root'>
                          {t('department:rootParent')}
                        </SelectItem>
                        {parentOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {'\u00A0'.repeat(opt.depth * 2)}
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='deptCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.deptCode')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'department:dialogs.deptCodePlaceholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='deptName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.deptName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'department:dialogs.deptNamePlaceholder'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='sortOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.sortOrder')}</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
                    </FormControl>
                    <FormMessage />
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
            <DialogTitle>{t('department:dialogs.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('department:dialogs.editDesc', {
                name: currentRow?.deptName ?? '',
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
                name='parentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.parent')}</FormLabel>
                    <Select
                      value={field.value ?? 'root'}
                      onValueChange={(v) =>
                        field.onChange(v === 'root' ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='root'>
                          {t('department:rootParent')}
                        </SelectItem>
                        {parentOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {'\u00A0'.repeat(opt.depth * 2)}
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='deptName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.deptName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='sortOrder'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('department:dialogs.sortOrder')}</FormLabel>
                    <FormControl>
                      <Input type='number' {...field} />
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
                    <FormLabel>{t('department:columns.status')}</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='1'>
                          {t('department:columns.active')}
                        </SelectItem>
                        <SelectItem value='0'>
                          {t('department:columns.inactive')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('department:dialogs.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('department:dialogs.deleteDesc', {
                name: currentRow?.deptName ?? '',
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
