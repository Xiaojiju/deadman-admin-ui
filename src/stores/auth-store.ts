import {
  type AuthTokenVO,
  type UserAuthorityVO,
  type UserProfileVO,
} from '@/types/api'
import { create } from 'zustand'
import { authApi } from '@/api/auth'
import { componentsApi } from '@/api/components'
import { userApi } from '@/api/user'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/lib/auth/token-storage'
import { hasPermission } from '@/lib/permissions'

export type AuthUser = UserProfileVO

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    roleCodes: string[]
    permissionCodes: string[]
    superAdmin: boolean
    installedComponentCodes: string[]
    sessionInitialized: boolean
    setAccessToken: (accessToken: string, expiresInSec?: number) => void
    setSession: (token: AuthTokenVO) => void
    setAuthority: (authority: UserAuthorityVO) => void
    setUser: (user: AuthUser | null) => void
    hasPermission: (required: string | string[]) => boolean
    loadSession: () => Promise<void>
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initToken = getAccessToken()

  return {
    auth: {
      user: null,
      accessToken: initToken,
      roleCodes: [],
      permissionCodes: [],
      superAdmin: false,
      installedComponentCodes: [],
      sessionInitialized: false,

      setAccessToken: (accessToken, expiresInSec) => {
        setAccessToken(accessToken, expiresInSec)
        set((state) => ({ ...state, auth: { ...state.auth, accessToken } }))
      },

      setSession: (token) => {
        setAccessToken(token.accessToken, token.expiresIn)
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            accessToken: token.accessToken,
            user: {
              userCode: token.userCode,
              username: null,
              nickname: token.nickname,
              avatar: null,
              status: 1,
              accounts: [],
              createTime: '',
            },
          },
        }))
      },

      setAuthority: (authority) =>
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            roleCodes: authority.roleCodes,
            permissionCodes: authority.permissionCodes,
            superAdmin: authority.superAdmin,
            sessionInitialized: true,
          },
        })),

      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),

      hasPermission: (required) => {
        const { permissionCodes, superAdmin } = get().auth
        return hasPermission(permissionCodes, required, superAdmin)
      },

      loadSession: async () => {
        const { accessToken } = get().auth
        if (!accessToken) return

        const [authority, profile, components] = await Promise.all([
          authApi.getPermissions(),
          userApi.getMyProfile(),
          componentsApi.list().catch(() => []),
        ])

        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            roleCodes: authority.roleCodes,
            permissionCodes: authority.permissionCodes,
            superAdmin: authority.superAdmin,
            installedComponentCodes: components.map((item) => item.code),
            user: profile,
            sessionInitialized: true,
          },
        }))
      },

      reset: () => {
        clearAccessToken()
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            user: null,
            accessToken: '',
            roleCodes: [],
            permissionCodes: [],
            superAdmin: false,
            installedComponentCodes: [],
            sessionInitialized: false,
          },
        }))
      },
    },
  }
})
