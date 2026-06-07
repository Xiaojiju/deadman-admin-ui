import i18n from '@/i18n'
import { ApiError } from '@/lib/http/api-error'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = i18n.t('common:toast.somethingWrong')

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = i18n.t('common:toast.noContent')
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as { msg?: string; title?: string } | undefined
    const msg = data?.msg
    const title = data?.title
    if (typeof msg === 'string' && msg.length > 0) {
      errMsg = msg
    } else if (typeof title === 'string' && title.length > 0) {
      errMsg = title
    }
  }

  if (error instanceof ApiError) {
    errMsg = error.message
  }

  toast.error(errMsg)
}
