import { useAuthStore } from '@/stores/auth-store'
import { hasPermission } from '@/lib/permissions'
import { PERMISSIONS } from '@/constants/permissions'
import { useInboxWebSocket } from '@/hooks/use-inbox-websocket'

function InboxWebSocketConnector() {
  useInboxWebSocket()
  return null
}

/**
 * Mounts inbox WebSocket only after auth session and permission are ready.
 * Note: ws://localhost:5173/?token=... in DevTools is Vite HMR, not this client.
 */
export function InboxWebSocketListener() {
  const accessToken = useAuthStore((s) => s.auth.accessToken)
  const sessionInitialized = useAuthStore((s) => s.auth.sessionInitialized)
  const permissionCodes = useAuthStore((s) => s.auth.permissionCodes)
  const superAdmin = useAuthStore((s) => s.auth.superAdmin)

  const token = accessToken?.trim()
  const canInbox = hasPermission(
    permissionCodes,
    PERMISSIONS.NOTIFICATION_INBOX_READ,
    superAdmin
  )

  if (!token || !sessionInitialized || !canInbox) return null

  return <InboxWebSocketConnector key={token} />
}
