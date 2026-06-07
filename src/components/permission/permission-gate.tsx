import { type PermissionInput } from '@/constants/permissions'
import { usePermission } from '@/hooks/use-permission'

export type PermissionGateProps = {
  /** 所需权限（数组表示满足其一即可）；未设置则始终展示 */
  permission?: PermissionInput
  /** 额外业务条件，默认 true */
  when?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 权限门控：无权限时不渲染 children（不挂载 DOM）。
 * 项目中唯一的权限 UI 组件，任意元素外包一层即可。
 *
 * @example
 * <PermissionGate permission={PERMISSIONS.ROLE_CREATE}>
 *   <Button>新建角色</Button>
 * </PermissionGate>
 *
 * @example
 * <PermissionGate permission={PERMISSIONS.USER_DELETE} when={!isSuperAdmin}>
 *   <DropdownMenuItem>删除</DropdownMenuItem>
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  when = true,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermission()

  if (!when) return fallback
  if (permission && !can(permission)) return fallback

  return children
}
