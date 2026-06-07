import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { clientUsersApi } from '@/api/client-users'
import { ApiError } from '@/lib/http/api-error'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useClientUsers } from './client-users-provider'

export function ClientUsersDialogs() {
  const { t } = useTranslation(['client', 'common'])
  const { open, setOpen, currentRow, setCurrentRow } = useClientUsers()
  const queryClient = useQueryClient()

  const { data: userDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['client-users', currentRow?.id],
    queryFn: () => clientUsersApi.getById(currentRow!.id),
    enabled: !!currentRow && open === 'detail',
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['client-users'] })
  }

  const closeDialog = () => {
    setOpen(null)
    setCurrentRow(null)
  }

  const disableMutation = useMutation({
    mutationFn: (userId: string) => clientUsersApi.disable(userId),
    onSuccess: () => {
      toast.success(t('client:users.toast.disabled'))
      invalidate()
      closeDialog()
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t('client:users.toast.disableFailed')
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => clientUsersApi.remove(userId),
    onSuccess: () => {
      toast.success(t('client:users.toast.deleted'))
      invalidate()
      closeDialog()
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t('client:users.toast.deleteFailed')
      )
    },
  })

  const displayName =
    currentRow?.nickname || currentRow?.username || currentRow?.userCode

  return (
    <>
      <Dialog
        open={open === 'detail'}
        onOpenChange={(next) => !next && closeDialog()}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('client:users.detail.title')}</DialogTitle>
            <DialogDescription>{displayName}</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='size-6 animate-spin text-muted-foreground' />
            </div>
          ) : userDetail ? (
            <div className='space-y-4'>
              <dl className='grid gap-3 text-sm sm:grid-cols-2'>
                <DetailItem
                  label={t('client:users.columns.userCode')}
                  value={userDetail.userCode}
                />
                <DetailItem
                  label={t('client:users.columns.phone')}
                  value={userDetail.phone || '-'}
                />
                <DetailItem
                  label={t('client:users.detail.username')}
                  value={userDetail.username || '-'}
                />
                <DetailItem
                  label={t('client:users.columns.status')}
                  value={
                    userDetail.status === 1
                      ? t('client:users.columns.active')
                      : t('client:users.columns.inactive')
                  }
                />
                <DetailItem
                  label={t('client:users.columns.createTime')}
                  value={new Date(userDetail.createTime).toLocaleString()}
                />
                <DetailItem
                  label={t('client:users.detail.updateTime')}
                  value={new Date(userDetail.updateTime).toLocaleString()}
                />
              </dl>

              <div>
                <h4 className='mb-2 text-sm font-medium'>
                  {t('client:users.detail.accounts')}
                </h4>
                {userDetail.accounts.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    {t('client:users.detail.noAccounts')}
                  </p>
                ) : (
                  <div className='overflow-hidden rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t('client:users.detail.accountType')}
                          </TableHead>
                          <TableHead>
                            {t('client:users.detail.accountIdentifier')}
                          </TableHead>
                          <TableHead>
                            {t('client:users.detail.oauthProvider')}
                          </TableHead>
                          <TableHead>
                            {t('client:users.detail.verified')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userDetail.accounts.map((account) => (
                          <TableRow
                            key={`${account.accountType}-${account.accountIdentifier}`}
                          >
                            <TableCell>{account.accountType}</TableCell>
                            <TableCell className='font-mono text-xs'>
                              {account.accountIdentifier}
                            </TableCell>
                            <TableCell>
                              {account.oauthProvider || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline'>
                                {account.verified === 1
                                  ? t('client:users.detail.verifiedYes')
                                  : t('client:users.detail.verifiedNo')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={open === 'disable'}
        onOpenChange={(next) => !next && closeDialog()}
        title={t('client:users.disable.title')}
        desc={t('client:users.disable.desc', { name: displayName })}
        confirmText={t('client:users.actions.disable')}
        destructive
        isLoading={disableMutation.isPending}
        handleConfirm={() => {
          if (currentRow) disableMutation.mutate(currentRow.id)
        }}
      />

      <ConfirmDialog
        open={open === 'delete'}
        onOpenChange={(next) => !next && closeDialog()}
        title={t('client:users.delete.title')}
        desc={t('client:users.delete.desc', { name: displayName })}
        confirmText={t('common:delete')}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (currentRow) deleteMutation.mutate(currentRow.id)
        }}
      />
    </>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='mt-0.5 font-medium'>{value}</dd>
    </div>
  )
}
