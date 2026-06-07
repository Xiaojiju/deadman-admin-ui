import { type UserAdminSummaryVO } from '@/types/api'

export function isSuperAdminUser(row: UserAdminSummaryVO) {
  return row.roleCodes.includes('SUPER_ADMIN')
}
