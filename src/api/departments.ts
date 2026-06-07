import { del, get, post, put } from '@/lib/http/request'
import {
  type CreateDepartmentRequest,
  type DepartmentTreeVO,
  type DepartmentVO,
  type UpdateDepartmentRequest,
} from '@/types/api'

export const departmentsApi = {
  list() {
    return get<DepartmentVO[]>('/api/departments')
  },

  tree() {
    return get<DepartmentTreeVO[]>('/api/departments/tree')
  },

  getById(departmentId: string) {
    return get<DepartmentVO>(`/api/departments/${departmentId}`)
  },

  create(body: CreateDepartmentRequest) {
    return post<DepartmentVO>('/api/departments', body)
  },

  update(departmentId: string, body: UpdateDepartmentRequest) {
    return put<DepartmentVO>(`/api/departments/${departmentId}`, body)
  },

  remove(departmentId: string) {
    return del<void>(`/api/departments/${departmentId}`)
  },
}
