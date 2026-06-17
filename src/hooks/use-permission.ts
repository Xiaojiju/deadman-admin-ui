import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { hasPermission } from '@/lib/permissions'
import { type PermissionInput } from '@/constants/permissions'

/**
 * 权限校验 hook。
 *
 * @example
 * const { can } = usePermission()
 * if (can(PERMISSIONS.ROLE_CREATE)) { ... }
 */
export function usePermission() {
  const permissionCodes = useAuthStore((s) => s.auth.permissionCodes)
  const superAdmin = useAuthStore((s) => s.auth.superAdmin)

  const can = useCallback(
    (required: PermissionInput) =>
      hasPermission(permissionCodes, required, superAdmin),
    [permissionCodes, superAdmin]
  )

  return {
    can,
    isSuperAdmin: superAdmin,
    permissionCodes,
  }
}

/**
 * 检查单个（或一组）权限，无权限时返回 false。
 *
 * @example
 * const canCreateRole = useHasPermission(PERMISSIONS.ROLE_CREATE)
 */
export function useHasPermission(required: PermissionInput) {
  const { can } = usePermission()
  return can(required)
}
