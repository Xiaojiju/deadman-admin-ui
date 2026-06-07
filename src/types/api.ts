/** deadman-common ResultBase */
export type ApiResult<T = unknown> = {
  code: number
  msg: string
  timestamp: number
  data: T
}

export type AuthTokenVO = {
  accessToken: string
  tokenType: string
  expiresIn: number
  userCode: string
  nickname: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type ChangePasswordRequest = {
  oldPassword: string
  newPassword: string
}

export type UserAuthorityVO = {
  roleCodes: string[]
  permissionCodes: string[]
  superAdmin: boolean
}

export type UserAccountBindingVO = {
  accountType: string
  accountIdentifier: string
  oauthProvider: string | null
  verified: number
  status: number
}

export type UserProfileVO = {
  userCode: string
  username: string | null
  nickname: string
  avatar: string | null
  status: number
  accounts: UserAccountBindingVO[]
  createTime: string
}

/** PUT /api/users/me，与 UpdateUserRequest 一致（status 会被服务端忽略） */
export type UpdateMyProfileRequest = {
  nickname?: string
  avatar?: string
}

export type PermissionItemVO = {
  code: string
  label: string
}

export type PermissionGroupVO = {
  code: string
  label: string
  permissions: PermissionItemVO[]
}

export type RoleSummaryVO = {
  id: string
  roleCode: string
  roleName: string
  description: string | null
  status: number
  systemBuiltin: boolean
}

export type RoleDetailVO = RoleSummaryVO & {
  permissionCodes: string[]
}

export type CreateRoleRequest = {
  roleCode: string
  roleName: string
  description?: string
  permissionCodes?: string[]
}

export type UpdateRoleRequest = {
  roleName?: string
  description?: string
  status?: number
}

export type AssignRolePermissionsRequest = {
  permissionCodes: string[]
}

export type AssignUserRolesRequest = {
  roleIds: string[]
}

export type PageVO<T> = {
  records: T[]
  total: number
  current: number
  size: number
}

export type OrgRefVO = {
  id: string
  code: string
  name: string
}

export type UserAdminSummaryVO = {
  id: string
  userCode: string
  username: string
  nickname: string
  avatar: string | null
  phone: string | null
  department: OrgRefVO | null
  positions: OrgRefVO[]
  status: number
  roleCodes: string[]
  createTime: string
}

export type UserAdminDetailVO = UserAdminSummaryVO & {
  updateTime: string
}

export type UserAdminPageQuery = {
  current?: number
  size?: number
  keyword?: string
  status?: number
}

export type CreateUserRequest = {
  username: string
  password: string
  nickname?: string
  avatar?: string
  phone?: string
  departmentId?: string
  positionIds?: string[]
}

export type UpdateUserRequest = {
  nickname?: string
  avatar?: string
  status?: number
  phone?: string
  departmentId?: string | null
  positionIds?: string[]
}

export type ResetUserPasswordRequest = {
  newPassword: string
}

export type DepartmentVO = {
  id: string
  parentId: string | null
  deptCode: string
  deptName: string
  sortOrder: number
  status: number
  createTime: string
  updateTime: string
}

export type DepartmentTreeVO = Omit<
  DepartmentVO,
  'createTime' | 'updateTime'
> & {
  children?: DepartmentTreeVO[]
}

export type CreateDepartmentRequest = {
  parentId?: string | null
  deptCode: string
  deptName: string
  sortOrder?: number
}

export type UpdateDepartmentRequest = {
  parentId?: string | null
  deptName?: string
  sortOrder?: number
  status?: number
}

export type PositionVO = {
  id: string
  departmentId: string | null
  positionCode: string
  positionName: string
  sortOrder: number
  status: number
  createTime: string
  updateTime: string
}

export type CreatePositionRequest = {
  departmentId?: string | null
  positionCode: string
  positionName: string
  sortOrder?: number
}

export type UpdatePositionRequest = {
  departmentId?: string | null
  positionName?: string
  sortOrder?: number
  status?: number
}

export type PositionListQuery = {
  departmentId?: string
}

export type NotificationInboxVO = {
  recipientId: string
  notificationId: string
  title: string
  content: string
  readStatus: 0 | 1
  readTime: string | null
  createTime: string
}

export type NotificationInboxPageQuery = {
  current?: number
  size?: number
  readStatus?: 0 | 1
}

export type NotificationTargetType = 1 | 2 | 3 | 4

export type SendNotificationRequest = {
  title: string
  content: string
  targetType: NotificationTargetType
  userIds?: string[]
  departmentIds?: string[]
  positionIds?: string[]
}

export type NotificationSendResultVO = {
  notificationId: string
  recipientCount: number
}

export type NotificationSentVO = {
  id: string
  title: string
  content: string
  targetType: NotificationTargetType
  recipientCount: number
  senderUserId: string
  createTime: string
}

export type NotificationSentPageQuery = {
  current?: number
  size?: number
  keyword?: string
}

export type ClientUserAccountBindingVO = {
  accountType: string
  accountIdentifier: string
  oauthProvider: string | null
  verified: number
  status: number
}

export type ClientUserAdminSummaryVO = {
  id: string
  userCode: string
  username: string | null
  nickname: string
  avatar: string | null
  phone: string | null
  status: number
  createTime: string
}

export type ClientUserAdminDetailVO = ClientUserAdminSummaryVO & {
  accounts: ClientUserAccountBindingVO[]
  updateTime: string
}

export type ClientUserAdminPageQuery = {
  current?: number
  size?: number
  keyword?: string
  status?: number
}

export type FileMetadataVO = {
  id: string
  fileCode: string
  originalFilename: string
  contentType: string
  sizeBytes: number
  providerId: string
  accessUrl: string
  bizType: string
  uploaderUserId: string
  createTime: string
}

export type DeadmanComponentVO = {
  code: string
  name: string
  description: string
  apiPrefix: string
  order: number
  uiHints?: Record<string, unknown>
}
