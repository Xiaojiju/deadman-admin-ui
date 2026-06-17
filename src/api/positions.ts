import {
  type CreatePositionRequest,
  type PositionListQuery,
  type PositionVO,
  type UpdatePositionRequest,
} from '@/types/api'
import { del, get, post, put } from '@/lib/http/request'

export const positionsApi = {
  list(query?: PositionListQuery) {
    return get<PositionVO[]>('/api/positions', {
      params: query?.departmentId
        ? { departmentId: query.departmentId }
        : undefined,
    })
  },

  getById(positionId: string) {
    return get<PositionVO>(`/api/positions/${positionId}`)
  },

  create(body: CreatePositionRequest) {
    return post<PositionVO>('/api/positions', body)
  },

  update(positionId: string, body: UpdatePositionRequest) {
    return put<PositionVO>(`/api/positions/${positionId}`, body)
  },

  remove(positionId: string) {
    return del<void>(`/api/positions/${positionId}`)
  },
}
