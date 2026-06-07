/** 与 deadman API 权限码保持一致 */
export const PERMISSIONS = {
  AUTH_PERMISSIONS_READ: 'auth:permissions:read',
  AUTH_PASSWORD_CHANGE: 'auth:password:change',
  USER_PROFILE_READ: 'user:profile:read',
  USER_PROFILE_UPDATE: 'user:profile:update',
  USER_LIST_READ: 'user:list:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_PASSWORD_RESET: 'user:password:reset',
  ROLE_LIST_READ: 'role:list:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_PERMISSION_ASSIGN: 'role:permission:assign',
  ROLE_USER_ASSIGN: 'role:user:assign',
  DEPT_LIST_READ: 'dept:list:read',
  DEPT_CREATE: 'dept:create',
  DEPT_UPDATE: 'dept:update',
  DEPT_DELETE: 'dept:delete',
  POSITION_LIST_READ: 'position:list:read',
  POSITION_CREATE: 'position:create',
  POSITION_UPDATE: 'position:update',
  POSITION_DELETE: 'position:delete',
  NOTIFICATION_INBOX_READ: 'notification:inbox:read',
  NOTIFICATION_INBOX_UPDATE: 'notification:inbox:update',
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_SENT_READ: 'notification:sent:read',
  CLIENT_USER_LIST_READ: 'client-user:list:read',
  CLIENT_USER_UPDATE: 'client-user:update',
  CLIENT_USER_DELETE: 'client-user:delete',
  FILE_UPLOAD: 'file:upload',
  FILE_READ: 'file:read',
  FILE_DOWNLOAD: 'file:download',
  FILE_DELETE: 'file:delete',
} as const

export type PermissionCode =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type PermissionInput = PermissionCode | PermissionCode[] | string | string[]
