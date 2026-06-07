import { PERMISSIONS, type PermissionInput } from '@/constants/permissions'

/** 路径 → 所需权限（与 sidebar 配置保持一致） */
export const ROUTE_PERMISSION_MAP: Record<string, PermissionInput> = {
  '/system/users': PERMISSIONS.USER_LIST_READ,
  '/system/roles': PERMISSIONS.ROLE_LIST_READ,
  '/system/permissions': PERMISSIONS.ROLE_LIST_READ,
  '/organization/departments': PERMISSIONS.DEPT_LIST_READ,
  '/organization/positions': PERMISSIONS.POSITION_LIST_READ,
  '/notifications/inbox': [
    PERMISSIONS.NOTIFICATION_INBOX_READ,
    PERMISSIONS.NOTIFICATION_SENT_READ,
  ],
  '/client/users': PERMISSIONS.CLIENT_USER_LIST_READ,
  '/settings/password': PERMISSIONS.AUTH_PASSWORD_CHANGE,
}

export function normalizeRoutePath(pathname: string) {
  const path = pathname.split('?')[0].replace(/\/+$/, '')
  return path || '/'
}

export function getRouteRequiredPermission(pathname: string) {
  return ROUTE_PERMISSION_MAP[normalizeRoutePath(pathname)]
}
