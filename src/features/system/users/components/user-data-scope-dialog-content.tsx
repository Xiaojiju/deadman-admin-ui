import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { departmentsApi } from '@/api/departments'
import { type DataScopeType, type DataScopeVO } from '@/types/api'
import { flattenDepartments } from '@/features/organization/utils/department-options'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DATA_SCOPE_TYPES: DataScopeType[] = [
  'ALL',
  'CUSTOM',
  'DEPT_AND_CHILD',
  'DEPT',
  'SELF',
]

type UserDataScopeDialogContentProps = {
  dataScope: DataScopeVO
  isPending: boolean
  saveLabel: string
  onSave: (payload: {
    scopeType: DataScopeType
    customDeptIds?: string[]
  }) => void
}

export function UserDataScopeDialogContent({
  dataScope,
  isPending,
  saveLabel,
  onSave,
}: UserDataScopeDialogContentProps) {
  const { t } = useTranslation('system')
  const [scopeType, setScopeType] = useState<DataScopeType>(dataScope.scopeType)
  const [customDeptIds, setCustomDeptIds] = useState<string[]>(
    dataScope.customDeptIds ?? []
  )
  const [customDeptError, setCustomDeptError] = useState<string | null>(null)

  useEffect(() => {
    setScopeType(dataScope.scopeType)
    setCustomDeptIds(dataScope.customDeptIds ?? [])
    setCustomDeptError(null)
  }, [dataScope])

  const { data: departments = [] } = useQuery({
    queryKey: ['departments', 'list'],
    queryFn: () => departmentsApi.list(),
  })

  const departmentOptions = useMemo(
    () => flattenDepartments(departments),
    [departments]
  )

  const handleSave = () => {
    if (scopeType === 'CUSTOM' && customDeptIds.length === 0) {
      setCustomDeptError(t('users.validation.customDeptRequired'))
      return
    }
    setCustomDeptError(null)
    onSave({
      scopeType,
      customDeptIds: scopeType === 'CUSTOM' ? customDeptIds : undefined,
    })
  }

  return (
    <>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label>{t('users.dialogs.dataScopeType')}</Label>
          <Select
            value={scopeType}
            onValueChange={(value) => {
              setScopeType(value as DataScopeType)
              setCustomDeptError(null)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATA_SCOPE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`users.dataScopeTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            {t(`users.dataScopeTypes.${scopeType}Desc`)}
          </p>
        </div>

        {scopeType === 'CUSTOM' ? (
          <div className='space-y-2'>
            <Label>{t('users.dialogs.customDepartments')}</Label>
            <ScrollArea className='h-56 rounded-md border p-3'>
              {departmentOptions.length ? (
                <div className='space-y-2'>
                  {departmentOptions.map((dept) => (
                    <label
                      key={dept.id}
                      className='flex items-center gap-2 text-sm'
                    >
                      <Checkbox
                        checked={customDeptIds.includes(dept.id)}
                        onCheckedChange={(checked) => {
                          setCustomDeptIds((prev) =>
                            checked === true
                              ? [...prev, dept.id]
                              : prev.filter((id) => id !== dept.id)
                          )
                          setCustomDeptError(null)
                        }}
                      />
                      <span>
                        {'\u00A0'.repeat(dept.depth * 2)}
                        {dept.label}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {t('users.dialogs.noDepartments')}
                </p>
              )}
            </ScrollArea>
            {customDeptError ? (
              <p className='text-sm text-destructive'>{customDeptError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <DialogFooter>
        <Button onClick={handleSave} disabled={isPending}>
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  )
}
