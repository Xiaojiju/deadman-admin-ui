import { get } from '@/lib/http/request'
import { type DeadmanComponentVO } from '@/types/api'

export const componentsApi = {
  list() {
    return get<DeadmanComponentVO[]>('/api/components')
  },
}
