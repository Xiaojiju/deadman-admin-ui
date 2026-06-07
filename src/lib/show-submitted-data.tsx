import i18n from '@/i18n'
import { toast } from 'sonner'

export function showSubmittedData(data: unknown, title?: string) {
  toast.message(title ?? i18n.t('common:submittedValues'), {
    description: (
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}
