import { type AuthTokenVO } from '@/types/api'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth-store'

export async function completeSignIn(token: AuthTokenVO) {
  const { auth } = useAuthStore.getState()
  auth.setSession(token)

  const [authority, profile] = await Promise.all([
    authApi.getPermissions(),
    userApi.getMyProfile(),
  ])

  auth.setAuthority(authority)
  auth.setUser(profile)

  return profile
}
