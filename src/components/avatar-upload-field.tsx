import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Upload, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { filesApi } from '@/api/files'
import { PERMISSIONS } from '@/constants/permissions'
import { resolveFileAccessUrl } from '@/lib/files/resolve-file-url'
import { ApiError } from '@/lib/http/api-error'
import { cn } from '@/lib/utils'
import { PermissionGate } from '@/components/permission'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const AVATAR_BIZ_TYPE = 'avatar'
const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

type AvatarUploadFieldProps = {
  value?: string
  displayName: string
  disabled?: boolean
  onUploaded: (accessUrl: string) => void | Promise<void>
  /** i18next namespace */
  i18nNamespace?: string
  /** Key prefix within namespace, e.g. `account.avatarUpload` */
  i18nKeyPrefix?: string
}

export function AvatarUploadField({
  value,
  displayName,
  disabled = false,
  onUploaded,
  i18nNamespace = 'settings',
  i18nKeyPrefix = 'account.avatarUpload',
}: AvatarUploadFieldProps) {
  const { t } = useTranslation(i18nNamespace)
  const tk = (key: string) => t(`${i18nKeyPrefix}.${key}`)
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
  }

  const setPreviewFromFile = (file: File | null) => {
    revokePreviewUrl()
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    previewUrlRef.current = objectUrl
    setPreviewUrl(objectUrl)
  }

  useEffect(() => () => revokePreviewUrl(), [])

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      filesApi.upload(file, { bizType: AVATAR_BIZ_TYPE }),
    onSuccess: async (metadata) => {
      await onUploaded(metadata.accessUrl)
      setPendingFile(null)
      setPreviewFromFile(null)
      if (inputRef.current) inputRef.current.value = ''
      toast.success(tk('toast.success'))
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tk('toast.failed')
      )
    },
  })

  const initials = displayName?.slice(0, 2)?.toUpperCase() || '?'
  const savedAvatarUrl = resolveFileAccessUrl(value)
  const shownAvatarUrl = previewUrl || savedAvatarUrl

  const handleSelectFile = (file: File | null) => {
    if (!file || disabled) return

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(tk('toast.invalidType'))
      return
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(tk('toast.tooLarge'))
      return
    }

    setPendingFile(file)
    setPreviewFromFile(file)
  }

  const handleCancelPending = () => {
    setPendingFile(null)
    setPreviewFromFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleConfirmUpload = () => {
    if (!pendingFile || uploadMutation.isPending) return
    uploadMutation.mutate(pendingFile)
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-4'>
        <div className='relative'>
          <Avatar className='h-20 w-20'>
            <AvatarImage src={shownAvatarUrl} alt={displayName} />
            <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
          </Avatar>
          {pendingFile ? (
            <Badge
              variant='secondary'
              className='absolute -end-2 -top-2 px-1.5 py-0 text-[10px]'
            >
              {tk('pending')}
            </Badge>
          ) : null}
        </div>

        <div className='space-y-2'>
          <PermissionGate permission={PERMISSIONS.FILE_UPLOAD}>
            <div className='flex flex-wrap gap-2'>
              <input
                ref={inputRef}
                type='file'
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className='hidden'
                disabled={disabled || uploadMutation.isPending}
                onChange={(event) => {
                  handleSelectFile(event.target.files?.[0] ?? null)
                }}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={disabled || uploadMutation.isPending}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className='me-2 size-4' />
                {tk('select')}
              </Button>

              {pendingFile ? (
                <>
                  <Button
                    type='button'
                    size='sm'
                    disabled={disabled || uploadMutation.isPending}
                    onClick={handleConfirmUpload}
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className='me-2 size-4 animate-spin' />
                    ) : null}
                    {tk('confirm')}
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    disabled={uploadMutation.isPending}
                    onClick={handleCancelPending}
                  >
                    <X className='me-2 size-4' />
                    {tk('cancel')}
                  </Button>
                </>
              ) : null}
            </div>
          </PermissionGate>

          <p
            className={cn(
              'text-sm text-muted-foreground',
              pendingFile && 'text-foreground'
            )}
          >
            {pendingFile ? tk('previewHint') : tk('desc')}
          </p>
        </div>
      </div>
    </div>
  )
}
