import { useEffect, useMemo } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { type TFunction } from 'i18next'
import { departmentsApi } from '@/api/departments'
import { positionsApi } from '@/api/positions'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { flattenDepartments } from '@/features/organization/utils/department-options'

type UserOrgFormFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  t: TFunction
}

export function UserOrgFormFields({ form, t }: UserOrgFormFieldsProps) {
  const departmentId = form.watch('departmentId') as string | null

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', 'list'],
    queryFn: () => departmentsApi.list(),
  })

  const departmentOptions = useMemo(
    () => flattenDepartments(departments),
    [departments]
  )

  const { data: availablePositions = [] } = useQuery({
    queryKey: ['positions', 'for-user', departmentId ?? 'none'],
    queryFn: async () => {
      if (!departmentId) {
        const all = await positionsApi.list()
        return all.filter((p) => p.departmentId === null)
      }
      return positionsApi.list({ departmentId })
    },
  })

  useEffect(() => {
    const currentIds =
      (form.getValues('positionIds') as string[] | undefined) ?? []
    const allowed = new Set(availablePositions.map((p) => p.id))
    const next = currentIds.filter((id) => allowed.has(id))
    if (next.length !== currentIds.length) {
      form.setValue('positionIds', next)
    }
  }, [availablePositions, form])

  return (
    <>
      <FormField
        control={form.control}
        name='departmentId'
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('system:users.dialogs.department')}</FormLabel>
            <Select
              value={field.value ?? 'none'}
              onValueChange={(v) => {
                field.onChange(v === 'none' ? null : v)
                form.setValue('positionIds', [])
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value='none'>
                  {t('system:users.dialogs.noDepartment')}
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
        control={form.control}
        name='positionIds'
        render={() => (
          <FormItem>
            <FormLabel>{t('system:users.dialogs.positions')}</FormLabel>
            <FormDescription>
              {t('system:users.dialogs.positionsHint')}
            </FormDescription>
            <ScrollArea className='h-36 rounded-md border p-3'>
              {availablePositions.length ? (
                <div className='space-y-2'>
                  {availablePositions.map((position) => (
                    <label
                      key={position.id}
                      className='flex items-center gap-2 text-sm'
                    >
                      <Checkbox
                        checked={(
                          form.watch('positionIds') as string[] | undefined
                        )?.includes(position.id)}
                        onCheckedChange={(checked) => {
                          const current =
                            (form.getValues('positionIds') as string[]) ?? []
                          form.setValue(
                            'positionIds',
                            checked
                              ? [...current, position.id]
                              : current.filter((id) => id !== position.id)
                          )
                        }}
                      />
                      <span>{position.positionName}</span>
                      {!position.departmentId ? (
                        <span className='text-xs text-muted-foreground'>
                          ({t('system:users.dialogs.globalPosition')})
                        </span>
                      ) : null}
                      <span className='font-mono text-xs text-muted-foreground'>
                        {position.positionCode}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {t('system:users.dialogs.noPositions')}
                </p>
              )}
            </ScrollArea>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
