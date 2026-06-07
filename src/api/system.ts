import { del, get, post, put } from '@/lib/http/request'
import {
  type AssignRolePermissionsRequest,
  type AssignUserRolesRequest,
  type CreateRoleRequest,
  type PermissionGroupVO,
  type PermissionItemVO,
  type RoleDetailVO,
  type RoleSummaryVO,
  type UpdateRoleRequest,
} from '@/types/api'

export const rolesApi = {
  list() {
    return get<RoleSummaryVO[]>('/api/roles')
  },

  getById(roleId: string) {
    return get<RoleDetailVO>(`/api/roles/${roleId}`)
  },

  create(body: CreateRoleRequest) {
    return post<RoleDetailVO>('/api/roles', body)
  },

  update(roleId: string, body: UpdateRoleRequest) {
    return put<RoleDetailVO>(`/api/roles/${roleId}`, body)
  },

  remove(roleId: string) {
    return del<void>(`/api/roles/${roleId}`)
  },

  assignPermissions(roleId: string, body: AssignRolePermissionsRequest) {
    return put<RoleDetailVO>(`/api/roles/${roleId}/permissions`, body)
  },

  assignUserRoles(userId: string, body: AssignUserRolesRequest) {
    return put<void>(`/api/roles/users/${userId}`, body)
  },
}

export const permissionsApi = {
  catalog() {
    return get<PermissionGroupVO[]>('/api/permissions/catalog')
  },

  listFlat() {
    return get<PermissionItemVO[]>('/api/permissions')
  },
}
