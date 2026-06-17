import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type NotificationInboxVO,
  type NotificationSentVO,
  type NotificationTargetType,
} from '@/types/api'
import {
  ArrowLeft,
  CheckCheck,
  Edit,
  Inbox as InboxIcon,
  Loader2,
  Mail,
  MailOpen,
  Search as SearchIcon,
  Send,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { notificationsApi } from '@/api/notifications'
import { formatUnreadBadge } from '@/lib/format-unread-badge'
import { ApiError } from '@/lib/http/api-error'
import { cn } from '@/lib/utils'
import { NOTIFICATION_QUERY_KEYS } from '@/constants/notification-query-keys'
import { PERMISSIONS } from '@/constants/permissions'
import { usePermission } from '@/hooks/use-permission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { PageLayout } from '@/components/layout/page-layout'
import { PermissionGate } from '@/components/permission'
import { SendNotificationDialog } from '../components/send-notification-dialog'
import { formatNotificationDateTime } from '../utils/format-date-time'

type ViewMode = 'inbox' | 'sent'
type ReadFilter = 'all' | '0' | '1'

function getTargetTypeLabel(
  t: (key: string) => string,
  targetType: NotificationTargetType
) {
  const map: Record<NotificationTargetType, string> = {
    1: t('notification:send.targetTypes.user'),
    2: t('notification:send.targetTypes.department'),
    3: t('notification:send.targetTypes.position'),
    4: t('notification:send.targetTypes.all'),
  }
  return map[targetType]
}

export function NotificationInbox() {
  const { t } = useTranslation(['notification', 'common'])
  const { can } = usePermission()
  const queryClient = useQueryClient()

  const canInbox = can(PERMISSIONS.NOTIFICATION_INBOX_READ)
  const canSent = can(PERMISSIONS.NOTIFICATION_SENT_READ)
  const canSend = can(PERMISSIONS.NOTIFICATION_SEND)

  const [view, setView] = useState<ViewMode>(canInbox ? 'inbox' : 'sent')
  const [sendOpen, setSendOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [inboxPage, setInboxPage] = useState(1)
  const [sentPage, setSentPage] = useState(1)
  const [sentKeyword, setSentKeyword] = useState('')
  const [sentSearch, setSentSearch] = useState('')

  const [selectedInbox, setSelectedInbox] =
    useState<NotificationInboxVO | null>(null)
  const [selectedSent, setSelectedSent] = useState<NotificationSentVO | null>(
    null
  )
  const [mobileSelected, setMobileSelected] = useState(false)

  const readStatus =
    readFilter === 'all' ? undefined : (Number(readFilter) as 0 | 1)

  const handleViewChange = (nextView: ViewMode) => {
    setView(nextView)
    setSelectedInbox(null)
    setSelectedSent(null)
    setMobileSelected(false)
    setSearch('')
    setSentKeyword('')
    setSentSearch('')
  }

  const handleReadFilterChange = (nextFilter: ReadFilter) => {
    setReadFilter(nextFilter)
    setInboxPage(1)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSentSearch(sentKeyword.trim())
      setSentPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [sentKeyword])

  const { data: unreadCount = 0 } = useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.unreadCount],
    queryFn: () => notificationsApi.unreadCount(),
    enabled: canInbox,
  })

  const {
    data: inboxData,
    isLoading: inboxLoading,
    isFetching: inboxFetching,
  } = useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.inbox, inboxPage, readStatus],
    queryFn: () =>
      notificationsApi.pageInbox({
        current: inboxPage,
        size: 20,
        readStatus,
      }),
    enabled: canInbox && view === 'inbox',
  })

  const {
    data: sentData,
    isLoading: sentLoading,
    isFetching: sentFetching,
  } = useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.sent, sentPage, sentSearch],
    queryFn: () =>
      notificationsApi.pageSent({
        current: sentPage,
        size: 20,
        keyword: sentSearch || undefined,
      }),
    enabled: canSent && view === 'sent',
  })

  const invalidateInbox = () => {
    void queryClient.invalidateQueries({
      queryKey: [NOTIFICATION_QUERY_KEYS.inbox],
    })
    void queryClient.invalidateQueries({
      queryKey: [NOTIFICATION_QUERY_KEYS.unreadCount],
    })
  }

  const markReadMutation = useMutation({
    mutationFn: (recipientId: string) => notificationsApi.markRead(recipientId),
    onSuccess: (_data, recipientId) => {
      invalidateInbox()
      setSelectedInbox((prev) =>
        prev?.recipientId === recipientId
          ? { ...prev, readStatus: 1, readTime: new Date().toISOString() }
          : prev
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t('notification:inbox.toast.markReadFailed')
      )
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      toast.success(t('notification:inbox.toast.markedAllRead'))
      invalidateInbox()
      setSelectedInbox((prev) =>
        prev
          ? { ...prev, readStatus: 1, readTime: new Date().toISOString() }
          : prev
      )
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t('notification:inbox.toast.markAllReadFailed')
      )
    },
  })

  const filteredInboxRecords = useMemo(() => {
    const records = inboxData?.records ?? []
    const keyword = search.trim().toLowerCase()
    if (!keyword) return records
    return records.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword)
    )
  }, [inboxData?.records, search])

  const inboxTotalPages = inboxData
    ? Math.max(1, Math.ceil(inboxData.total / inboxData.size))
    : 1
  const sentTotalPages = sentData
    ? Math.max(1, Math.ceil(sentData.total / sentData.size))
    : 1

  const handleSelectInbox = (item: NotificationInboxVO) => {
    setSelectedInbox(item)
    setSelectedSent(null)
    setMobileSelected(true)
    if (item.readStatus === 0) {
      markReadMutation.mutate(item.recipientId)
    }
  }

  const handleSelectSent = (item: NotificationSentVO) => {
    setSelectedSent(item)
    setSelectedInbox(null)
    setMobileSelected(true)
  }

  const showDetail = view === 'inbox' ? selectedInbox : selectedSent

  return (
    <PageLayout fixed>
      <Main fixed className='min-h-0 flex-1'>
        <section className='flex min-h-0 flex-1 gap-6 overflow-hidden'>
          <div className='flex min-h-0 w-full flex-col gap-2 sm:w-56 lg:w-80 2xl:w-96'>
            <div className='sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl font-bold'>
                    {t('notification:page.title')}
                  </h1>
                  <InboxIcon size={20} />
                  {canInbox && formatUnreadBadge(unreadCount) ? (
                    <Badge variant='default' className='rounded-full px-2'>
                      {formatUnreadBadge(unreadCount)}
                    </Badge>
                  ) : null}
                </div>
                <div className='flex items-center gap-1'>
                  {view === 'inbox' ? (
                    <PermissionGate
                      permission={PERMISSIONS.NOTIFICATION_INBOX_UPDATE}
                    >
                      <Button
                        size='sm'
                        variant='ghost'
                        className='h-8 gap-1 px-2'
                        disabled={
                          unreadCount === 0 || markAllReadMutation.isPending
                        }
                        onClick={() => markAllReadMutation.mutate()}
                      >
                        {markAllReadMutation.isPending ? (
                          <Loader2 className='size-4 animate-spin' />
                        ) : (
                          <CheckCheck className='size-4' />
                        )}
                        <span className='hidden lg:inline'>
                          {t('notification:inbox.markAllRead')}
                        </span>
                      </Button>
                    </PermissionGate>
                  ) : null}
                  <PermissionGate permission={PERMISSIONS.NOTIFICATION_SEND}>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='rounded-lg'
                      onClick={() => setSendOpen(true)}
                    >
                      <Edit size={22} className='stroke-muted-foreground' />
                    </Button>
                  </PermissionGate>
                </div>
              </div>

              {canInbox && canSent ? (
                <Tabs
                  value={view}
                  onValueChange={(v) => handleViewChange(v as ViewMode)}
                  className='mb-3'
                >
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='inbox' className='gap-1.5'>
                      {t('notification:page.inboxTab')}
                      {formatUnreadBadge(unreadCount) ? (
                        <Badge
                          variant='destructive'
                          className='h-5 min-w-5 rounded-full px-1.5 text-xs'
                        >
                          {formatUnreadBadge(unreadCount)}
                        </Badge>
                      ) : null}
                    </TabsTrigger>
                    <TabsTrigger value='sent'>
                      {t('notification:page.sentTab')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              ) : null}

              {view === 'inbox' && canInbox ? (
                <>
                  <Tabs
                    value={readFilter}
                    onValueChange={(v) =>
                      handleReadFilterChange(v as ReadFilter)
                    }
                    className='mb-3'
                  >
                    <TabsList className='grid w-full grid-cols-3'>
                      <TabsTrigger value='all'>
                        {t('notification:inbox.filterAll')}
                      </TabsTrigger>
                      <TabsTrigger value='0'>
                        {t('notification:inbox.filterUnread')}
                      </TabsTrigger>
                      <TabsTrigger value='1'>
                        {t('notification:inbox.filterRead')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <label
                    className={cn(
                      'focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden',
                      'flex h-10 w-full items-center rounded-md border border-border ps-2'
                    )}
                  >
                    <SearchIcon
                      size={15}
                      className='me-2 stroke-muted-foreground'
                    />
                    <input
                      type='text'
                      className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                      placeholder={t('notification:inbox.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </>
              ) : null}

              {view === 'sent' && canSent ? (
                <label
                  className={cn(
                    'focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden',
                    'flex h-10 w-full items-center rounded-md border border-border ps-2'
                  )}
                >
                  <SearchIcon
                    size={15}
                    className='me-2 stroke-muted-foreground'
                  />
                  <input
                    type='text'
                    className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                    placeholder={t('notification:sent.searchPlaceholder')}
                    value={sentKeyword}
                    onChange={(e) => setSentKeyword(e.target.value)}
                  />
                </label>
              ) : null}
            </div>

            <ScrollArea className='-mx-3 min-h-0 flex-1 p-3'>
              {view === 'inbox' && canInbox ? (
                inboxLoading ? (
                  <div className='flex justify-center py-8'>
                    <Loader2 className='size-6 animate-spin text-muted-foreground' />
                  </div>
                ) : filteredInboxRecords.length === 0 ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>
                    {t('notification:inbox.emptyList')}
                  </p>
                ) : (
                  filteredInboxRecords.map((item) => (
                    <div key={item.recipientId}>
                      <button
                        type='button'
                        className={cn(
                          'group hover:bg-accent hover:text-accent-foreground',
                          'flex w-full rounded-md px-2 py-2 text-start text-sm',
                          selectedInbox?.recipientId === item.recipientId &&
                            'sm:bg-muted',
                          item.readStatus === 0 && 'font-medium'
                        )}
                        onClick={() => handleSelectInbox(item)}
                      >
                        <div className='flex w-full gap-3'>
                          <div
                            className={cn(
                              'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                              item.readStatus === 0
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {item.readStatus === 0 ? (
                              <Mail size={16} />
                            ) : (
                              <MailOpen size={16} />
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-start justify-between gap-2'>
                              <span className='line-clamp-1'>{item.title}</span>
                              {item.readStatus === 0 ? (
                                <span className='mt-1 size-2 shrink-0 rounded-full bg-primary' />
                              ) : null}
                            </div>
                            <span className='line-clamp-2 text-xs text-muted-foreground group-hover:text-accent-foreground/90'>
                              {item.content}
                            </span>
                            <span className='mt-1 block text-xs text-muted-foreground'>
                              {formatNotificationDateTime(item.createTime)}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </div>
                  ))
                )
              ) : null}

              {view === 'sent' && canSent ? (
                sentLoading ? (
                  <div className='flex justify-center py-8'>
                    <Loader2 className='size-6 animate-spin text-muted-foreground' />
                  </div>
                ) : (sentData?.records ?? []).length === 0 ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>
                    {t('notification:sent.emptyList')}
                  </p>
                ) : (
                  (sentData?.records ?? []).map((item) => (
                    <div key={item.id}>
                      <button
                        type='button'
                        className={cn(
                          'group hover:bg-accent hover:text-accent-foreground',
                          'flex w-full rounded-md px-2 py-2 text-start text-sm',
                          selectedSent?.id === item.id && 'sm:bg-muted'
                        )}
                        onClick={() => handleSelectSent(item)}
                      >
                        <div className='flex w-full gap-3'>
                          <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                            <Send size={16} />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <span className='line-clamp-1 font-medium'>
                              {item.title}
                            </span>
                            <span className='line-clamp-1 text-xs text-muted-foreground'>
                              {getTargetTypeLabel(t, item.targetType)} ·{' '}
                              {t('notification:sent.recipientCount', {
                                count: item.recipientCount,
                              })}
                            </span>
                            <span className='mt-1 block text-xs text-muted-foreground'>
                              {formatNotificationDateTime(item.createTime)}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </div>
                  ))
                )
              ) : null}
            </ScrollArea>

            {view === 'inbox' && inboxTotalPages > 1 ? (
              <PaginationBar
                page={inboxPage}
                totalPages={inboxTotalPages}
                isFetching={inboxFetching}
                onPrev={() => setInboxPage((p) => Math.max(1, p - 1))}
                onNext={() => setInboxPage((p) => p + 1)}
                t={t}
              />
            ) : null}

            {view === 'sent' && sentTotalPages > 1 ? (
              <PaginationBar
                page={sentPage}
                totalPages={sentTotalPages}
                isFetching={sentFetching}
                onPrev={() => setSentPage((p) => Math.max(1, p - 1))}
                onNext={() => setSentPage((p) => p + 1)}
                t={t}
              />
            ) : null}
          </div>

          {showDetail ? (
            <DetailPanel
              view={view}
              selectedInbox={selectedInbox}
              selectedSent={selectedSent}
              mobileSelected={mobileSelected}
              onMobileBack={() => setMobileSelected(false)}
              markReadPending={markReadMutation.isPending}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              t={t}
            />
          ) : (
            <EmptyDetailPanel
              canSend={canSend}
              onCompose={() => setSendOpen(true)}
              t={t}
            />
          )}
        </section>

        {canSend ? (
          <SendNotificationDialog open={sendOpen} onOpenChange={setSendOpen} />
        ) : null}
      </Main>
    </PageLayout>
  )
}

function PaginationBar({
  page,
  totalPages,
  isFetching,
  onPrev,
  onNext,
  t,
}: {
  page: number
  totalPages: number
  isFetching: boolean
  onPrev: () => void
  onNext: () => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div className='flex items-center justify-between gap-2 px-1 pt-1'>
      <Button
        variant='outline'
        size='sm'
        disabled={page <= 1 || isFetching}
        onClick={onPrev}
      >
        {t('common:goToPreviousPage')}
      </Button>
      <span className='text-xs text-muted-foreground'>
        {t('common:pageOf', { current: page, total: totalPages })}
      </span>
      <Button
        variant='outline'
        size='sm'
        disabled={page >= totalPages || isFetching}
        onClick={onNext}
      >
        {t('common:goToNextPage')}
      </Button>
    </div>
  )
}

function DetailPanel({
  view,
  selectedInbox,
  selectedSent,
  mobileSelected,
  onMobileBack,
  markReadPending,
  onMarkRead,
  t,
}: {
  view: ViewMode
  selectedInbox: NotificationInboxVO | null
  selectedSent: NotificationSentVO | null
  mobileSelected: boolean
  onMobileBack: () => void
  markReadPending: boolean
  onMarkRead: (id: string) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  if (view === 'inbox' && selectedInbox) {
    return (
      <div
        className={cn(
          'absolute inset-0 start-full z-50 hidden min-h-0 w-full flex-1 flex-col overflow-hidden border bg-background shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
          mobileSelected && 'inset-s-0 flex'
        )}
      >
        <div className='mb-1 flex shrink-0 items-start justify-between gap-4 border-b bg-card p-4 sm:rounded-t-md'>
          <div className='flex min-w-0 items-start gap-3'>
            <Button
              size='icon'
              variant='ghost'
              className='-ms-2 shrink-0 sm:hidden'
              onClick={onMobileBack}
            >
              <ArrowLeft className='rtl:rotate-180' />
            </Button>
            <div className='min-w-0 space-y-2'>
              <h2 className='text-xl leading-snug font-bold text-balance sm:text-2xl lg:text-3xl'>
                {selectedInbox.title}
              </h2>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant={
                    selectedInbox.readStatus === 0 ? 'default' : 'secondary'
                  }
                >
                  {selectedInbox.readStatus === 0
                    ? t('notification:inbox.unread')
                    : t('notification:inbox.read')}
                </Badge>
                <span className='text-xs text-muted-foreground'>
                  {t('notification:inbox.receivedAt')}:{' '}
                  {formatNotificationDateTime(selectedInbox.createTime)}
                </span>
              </div>
            </div>
          </div>
          <PermissionGate permission={PERMISSIONS.NOTIFICATION_INBOX_UPDATE}>
            {selectedInbox.readStatus === 0 ? (
              <Button
                size='sm'
                variant='outline'
                disabled={markReadPending}
                onClick={() => onMarkRead(selectedInbox.recipientId)}
              >
                {markReadPending ? (
                  <Loader2 className='me-1 size-4 animate-spin' />
                ) : (
                  <CheckCheck className='me-1 size-4' />
                )}
                {t('notification:inbox.markRead')}
              </Button>
            ) : null}
          </PermissionGate>
        </div>
        <ScrollArea className='min-h-0 flex-1 px-6 py-8'>
          <article className='mx-auto max-w-2xl space-y-6 pb-4'>
            <div className='text-base leading-loose break-words whitespace-pre-wrap sm:text-lg'>
              {selectedInbox.content}
            </div>
            {selectedInbox.readTime ? (
              <p className='text-xs text-muted-foreground'>
                {t('notification:inbox.readAt')}:{' '}
                {formatNotificationDateTime(selectedInbox.readTime)}
              </p>
            ) : null}
          </article>
        </ScrollArea>
      </div>
    )
  }

  if (view === 'sent' && selectedSent) {
    return (
      <div
        className={cn(
          'absolute inset-0 start-full z-50 hidden min-h-0 w-full flex-1 flex-col overflow-hidden border bg-background shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md',
          mobileSelected && 'inset-s-0 flex'
        )}
      >
        <div className='mb-1 flex shrink-0 items-start gap-3 border-b bg-card p-4 sm:rounded-t-md'>
          <Button
            size='icon'
            variant='ghost'
            className='-ms-2 shrink-0 sm:hidden'
            onClick={onMobileBack}
          >
            <ArrowLeft className='rtl:rotate-180' />
          </Button>
          <div className='min-w-0 space-y-1'>
            <h2 className='text-xl leading-snug font-bold text-balance sm:text-2xl lg:text-3xl'>
              {selectedSent.title}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {formatNotificationDateTime(selectedSent.createTime)}
            </p>
          </div>
        </div>
        <ScrollArea className='min-h-0 flex-1 px-6 py-8'>
          <article className='mx-auto max-w-2xl space-y-6 pb-4'>
            <div className='grid gap-3 rounded-lg border p-4 text-sm'>
              <div className='flex justify-between gap-4'>
                <span className='text-muted-foreground'>
                  {t('notification:sent.targetType')}
                </span>
                <span>{getTargetTypeLabel(t, selectedSent.targetType)}</span>
              </div>
              <div className='flex justify-between gap-4'>
                <span className='text-muted-foreground'>
                  {t('notification:sent.recipientCountLabel')}
                </span>
                <span>{selectedSent.recipientCount}</span>
              </div>
              <div className='flex justify-between gap-4'>
                <span className='text-muted-foreground'>
                  {t('notification:sent.sentAt')}
                </span>
                <span>
                  {formatNotificationDateTime(selectedSent.createTime)}
                </span>
              </div>
            </div>
            <div className='text-base leading-loose break-words whitespace-pre-wrap sm:text-lg'>
              {selectedSent.content}
            </div>
          </article>
        </ScrollArea>
      </div>
    )
  }

  return null
}

function EmptyDetailPanel({
  canSend,
  onCompose,
  t,
}: {
  canSend: boolean
  onCompose: () => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 start-full z-50 hidden min-h-0 w-full flex-1 flex-col justify-center overflow-hidden rounded-md border bg-card shadow-xs sm:static sm:z-auto sm:flex'
      )}
    >
      <div className='flex flex-col items-center space-y-6 px-4'>
        <div className='flex size-16 items-center justify-center rounded-full border-2 border-border'>
          <InboxIcon className='size-8' />
        </div>
        <div className='space-y-2 text-center'>
          <h2 className='text-xl font-semibold'>
            {t('notification:inbox.emptyDetailTitle')}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t('notification:inbox.emptyDetailDesc')}
          </p>
        </div>
        {canSend ? (
          <Button onClick={onCompose}>
            <Edit className='me-2 size-4' />
            {t('notification:send.compose')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
