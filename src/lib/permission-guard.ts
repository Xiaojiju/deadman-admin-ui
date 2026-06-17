import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { getRouteRequiredPermission } from '@/lib/route-permissions'
import { type PermissionInput } from '@/constants/permissions'

const UNAUTHORIZED_PATH = '/401'

/** 校验当前用户是否拥有指定权限，否则跳转无权限页 */
export function requirePermission(required: PermissionInput) {
  const { hasPermission } = useAuthStore.getState().auth
  if (!hasPermission(required)) {
    throw redirect({ to: UNAUTHORIZED_PATH })
  }
}

/** 根据访问路径校验路由权限（路径未配置权限则放行） */
export function requireRoutePermission(pathname: string) {
  const required = getRouteRequiredPermission(pathname)
  if (required) {
    requirePermission(required)
  }
}
