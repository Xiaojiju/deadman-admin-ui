import { type PermissionInput } from '@/constants/permissions'

export function hasPermission(
  permissionCodes: string[],
  required: PermissionInput,
  superAdmin = false
): boolean {
  if (superAdmin) return true
  const codes = Array.isArray(required) ? required : [required]
  return codes.some((code) => permissionCodes.includes(code))
}

export function filterByPermission<T extends { permission?: PermissionInput }>(
  items: T[],
  permissionCodes: string[],
  superAdmin: boolean
): T[] {
  return items.filter(
    (item) =>
      !item.permission ||
      hasPermission(permissionCodes, item.permission, superAdmin)
  )
}
