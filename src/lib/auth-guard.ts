import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

/** Guard for routes under `/_authenticated`. Redirects guests to sign-in. */
export async function requireAuth(locationHref: string) {
  const auth = useAuthStore.getState().auth

  if (!auth.accessToken) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: locationHref },
    })
  }

  if (!auth.sessionInitialized) {
    try {
      await auth.loadSession()
    } catch {
      auth.reset()
      throw redirect({
        to: '/sign-in',
        search: { redirect: locationHref },
      })
    }
  }
}

/** Redirect signed-in users away from guest-only routes (e.g. sign-in). */
export function redirectIfAuthenticated(fallbackTo = '/') {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    throw redirect({ to: fallbackTo })
  }
}
