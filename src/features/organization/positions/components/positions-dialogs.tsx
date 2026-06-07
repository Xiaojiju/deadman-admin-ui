import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type DepartmentVO } from '@/types/api'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { departmentsApi } from '@/api/departments'
import { positionsApi } from '@/api/positions'
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
import { usePositions } from './positions-provider'

function createCreateSchema(t: (key: string) => string) {
  return z.object({
    departmentId: z.string().nullable(),
    positionCode: z
      .string()
      .regex(
        /^[A-Z][A-Z0-9_]{1,63}$/,
        t('position:validation.positionCodeInvalid')
      ),
    positionName: z.string().min(1).max(128),
    sortOrder: z.number().int().optional(),
  })
}

const editSchema = z.object({
  departmentId: z.string().nullable(),
  positionName: z.string().min(1).max(128),
  sortOrder: z.number().int().optional(),
  status: z.number().int(),
})

function flattenDepartments(
  flatList: DepartmentVO[]
): { id: string; label: string; depth: number }[] {
  const byParent = new Map<string | null, DepartmentVO[]>()
  for (const d of flatList) {
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

export function PositionsDialogs() {
  const { t } = useTranslation(['position', 'common'])
  const { open, setOpen, currentRow, setCurrentRow } = usePositions()
  const queryClient = useQueryClient()
  const createSchema = useMemo(() => createCreateSchema(t), [t])

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', 'list'],
    queryFn: () => departmentsApi.list(),
    enabled: open === 'create' || open === 'edit',
  })

  const departmentOptions = useMemo(
    () => flattenDepartments(departments),
    [departments]
  )

  const { data: positionDetail } = useQuery({
    queryKey: ['positions', currentRow?.id],
    queryFn: () => positionsApi.getById(currentRow!.id),
    enabled: !!currentRow && open === 'edit',
  })

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      departmentId: null,
      positionCode: '',
      positionName: '',
      sortOrder: 0,
    },
  })

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: positionDetail
      ? {
          departmentId: positionDetail.departmentId,
          positionName: positionDetail.positionName,
          sortOrder: positionDetail.sortOrder,
          status: positionDetail.status,
        }
      : undefined,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['positions'] })

  const createMutation = useMutation({
    mutationFn: positionsApi.create,
    onSuccess: () => {
      invalidate()
      setOpen(null)
      createForm.reset()
      toast.success(t('position:toast.created'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('position:toast.createFailed')
      ),
  })

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof editSchema>) =>
      positionsApi.update(currentRow!.id, values),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('position:toast.updated'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('position:toast.updateFailed')
      ),
  })

  const deleteMutation = useMutation({
    mutationFn: () => positionsApi.remove(currentRow!.id),
    onSuccess: () => {
      invalidate()
      setOpen(null)
      setCurrentRow(null)
      toast.success(t('position:toast.deleted'))
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError ? e.message : t('position:toast.deleteFailed')
      ),
  })

  return (
    <>
      <Dialog open={open === 'create'} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('position:dialogs.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('position:dialogs.createDesc')}
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
                name='departmentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('position:dialogs.department')}</FormLabel>
                    <Select
                      value={field.value ?? 'global'}
                      onValueChange={(v) =>
                        field.onChange(v === 'global' ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='global'>
                          {t('position:noDepartment')}
                        </SelectItem>
                        {departmentOptions.map((opt) => (
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
                name='positionCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('position:dialogs.positionCode')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'position:dialogs.positionCodePlaceholder'
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
                name='positionName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('position:dialogs.positionName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'position:dialogs.positionNamePlaceholder'
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
                    <FormLabel>{t('position:dialogs.sortOrder')}</FormLabel>
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
            <DialogTitle>{t('position:dialogs.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('position:dialogs.editDesc', {
                name: currentRow?.positionName ?? '',
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
                name='departmentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('position:dialogs.department')}</FormLabel>
                    <Select
                      value={field.value ?? 'global'}
                      onValueChange={(v) =>
                        field.onChange(v === 'global' ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='global'>
                          {t('position:noDepartment')}
                        </SelectItem>
                        {departmentOptions.map((opt) => (
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
                name='positionName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('position:dialogs.positionName')}</FormLabel>
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
                    <FormLabel>{t('position:dialogs.sortOrder')}</FormLabel>
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
                    <FormLabel>{t('position:columns.status')}</FormLabel>
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
                          {t('position:columns.active')}
                        </SelectItem>
                        <SelectItem value='0'>
                          {t('position:columns.inactive')}
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
            <DialogTitle>{t('position:dialogs.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('position:dialogs.deleteDesc', {
                name: currentRow?.positionName ?? '',
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
