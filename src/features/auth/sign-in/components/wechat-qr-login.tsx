import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'
import { useTranslation } from 'react-i18next'
import { wechatApi } from '@/api/wechat'
import { ApiError } from '@/lib/http/api-error'
import { Button } from '@/components/ui/button'

export function WechatQrLogin() {
  const { t } = useTranslation('auth')
  const [qrDataUrl, setQrDataUrl] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadQrRef = useRef<() => Promise<void>>(async () => {})

  const loadQr = useCallback(async () => {
    setLoading(true)
    setError(null)
    setQrDataUrl(undefined)

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }

    try {
      const data = await wechatApi.initiateWebLogin()
      const dataUrl = await QRCode.toDataURL(data.authorizeUrl, {
        width: 220,
        margin: 1,
      })
      setQrDataUrl(dataUrl)

      const refreshInMs = Math.max(
        (data.stateExpiresInSeconds - 15) * 1000,
        30_000
      )
      refreshTimerRef.current = setTimeout(() => {
        void loadQrRef.current()
      }, refreshInMs)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('wechat.qrLoadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadQrRef.current = loadQr
  }, [loadQr])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadQrRef.current()
    }, 0)

    return () => {
      window.clearTimeout(timerId)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  return (
    <div className='flex flex-col items-center gap-3'>
      <p className='text-sm text-muted-foreground'>{t('wechat.qrHint')}</p>
      <div className='flex h-[220px] w-[220px] items-center justify-center rounded-md border bg-muted/30'>
        {loading ? (
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        ) : error ? (
          <div className='space-y-2 px-4 text-center'>
            <p className='text-sm text-destructive'>{error}</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void loadQr()}
            >
              <RefreshCw className='me-2 h-4 w-4' />
              {t('wechat.retry')}
            </Button>
          </div>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={t('wechat.qrAlt')}
            width={220}
            height={220}
            className='rounded-sm'
          />
        ) : null}
      </div>
      {!loading && !error ? (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => void loadQr()}
        >
          <RefreshCw className='me-2 h-4 w-4' />
          {t('wechat.refreshQr')}
        </Button>
      ) : null}
    </div>
  )
}
