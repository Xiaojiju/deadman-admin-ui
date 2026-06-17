import { type DeadmanComponentVO } from '@/types/api'
import { get } from '@/lib/http/request'

export const componentsApi = {
  list() {
    return get<DeadmanComponentVO[]>('/api/components')
  },
}
