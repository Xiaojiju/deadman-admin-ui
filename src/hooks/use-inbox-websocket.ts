import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NOTIFICATION_QUERY_KEYS } from '@/constants/notification-query-keys'
import { showAppToast } from '@/lib/toast/show-app-toast'
import { incrementUnreadCount } from '@/lib/unread-count'
import {
  parseInboxWebSocketMessage,
  type InboxNotificationPayload,
} from '@/lib/ws/parse-inbox-ws-message'
import { resolveInboxWebSocketURL } from '@/lib/ws/resolve-inbox-ws-url'
import { useAuthStore } from '@/stores/auth-store'

const HEARTBEAT_INTERVAL_MS = 30_000
const PONG_TIMEOUT_MS = 10_000
const MAX_RECONNECT_DELAY_MS = 30_000
const MIN_RECONNECT_DELAY_MS = 1_000
const RECONNECT_DECREASE_STEP_MS = 5_000

function isPongMessage(data: string): boolean {
  return data.trim().toLowerCase() === 'pong'
}

function disposeWebSocket(ws: WebSocket | null) {
  if (!ws) return

  ws.onopen = null
  ws.onclose = null
  ws.onerror = null
  ws.onmessage = null

  if (
    ws.readyState === WebSocket.CONNECTING ||
    ws.readyState === WebSocket.OPEN
  ) {
    ws.close(1000, 'Client disconnected')
  }
}

function getActiveToken(): string | null {
  const token = useAuthStore.getState().auth.accessToken?.trim()
  return token || null
}

export function useInboxWebSocket() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation(['notification'])

  const queryClientRef = useRef(queryClient)
  const navigateRef = useRef(navigate)
  const tRef = useRef(t)

  useEffect(() => {
    queryClientRef.current = queryClient
    navigateRef.current = navigate
    tRef.current = t
  }, [queryClient, navigate, t])

  const reconnectDelayRef = useRef(MAX_RECONNECT_DELAY_MS)

  useEffect(() => {
    const token = getActiveToken()
    if (!token) return

    let cancelled = false
    let ws: WebSocket | null = null
    let reconnectTimer: number | null = null
    let connectTimer: number | null = null
    let heartbeatTimer: number | null = null
    let pongTimeoutTimer: number | null = null
    let awaitingPong = false

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    const clearHeartbeat = () => {
      if (heartbeatTimer !== null) {
        window.clearInterval(heartbeatTimer)
        heartbeatTimer = null
      }
      if (pongTimeoutTimer !== null) {
        window.clearTimeout(pongTimeoutTimer)
        pongTimeoutTimer = null
      }
      awaitingPong = false
    }

    const scheduleReconnect = () => {
      if (cancelled) return

      clearReconnectTimer()
      const delay = reconnectDelayRef.current
      reconnectTimer = window.setTimeout(connect, delay)
      reconnectDelayRef.current = Math.max(
        MIN_RECONNECT_DELAY_MS,
        delay - RECONNECT_DECREASE_STEP_MS
      )
    }

    const handlePong = () => {
      if (pongTimeoutTimer !== null) {
        window.clearTimeout(pongTimeoutTimer)
        pongTimeoutTimer = null
      }
      awaitingPong = false
    }

    const handlePongTimeout = () => {
      pongTimeoutTimer = null
      awaitingPong = false
      disposeWebSocket(ws)
      ws = null
    }

    const sendPing = () => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return

      if (awaitingPong) {
        disposeWebSocket(ws)
        ws = null
        return
      }

      ws.send('ping')
      awaitingPong = true
      pongTimeoutTimer = window.setTimeout(handlePongTimeout, PONG_TIMEOUT_MS)
    }

    const startHeartbeat = () => {
      clearHeartbeat()
      sendPing()
      heartbeatTimer = window.setInterval(sendPing, HEARTBEAT_INTERVAL_MS)
    }

    const handleMessage = (payload: InboxNotificationPayload) => {
      showAppToast(
        {
          type: 'inbox-notification',
          notificationId: payload.notificationId,
          title: payload.title,
          content: payload.content,
        },
        {
          viewLabel: tRef.current('notification:inbox.toast.view'),
          onNavigate: (href) => {
            void navigateRef.current({ href })
          },
        }
      )

      queryClientRef.current.setQueryData<number>(
        [NOTIFICATION_QUERY_KEYS.unreadCount],
        (current) => incrementUnreadCount(current)
      )
      void queryClientRef.current.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.inbox],
      })
    }

    const connect = () => {
      if (cancelled) return

      const currentToken = getActiveToken()
      if (!currentToken) return

      clearReconnectTimer()
      clearHeartbeat()
      disposeWebSocket(ws)
      ws = null

      ws = new WebSocket(resolveInboxWebSocketURL(currentToken))
      const activeSocket = ws

      activeSocket.onopen = () => {
        if (cancelled || ws !== activeSocket) return
        reconnectDelayRef.current = MAX_RECONNECT_DELAY_MS
        startHeartbeat()
      }

      activeSocket.onmessage = (event) => {
        if (cancelled || ws !== activeSocket) return

        const raw = String(event.data)
        if (isPongMessage(raw)) {
          handlePong()
          return
        }

        try {
          const payload = parseInboxWebSocketMessage(JSON.parse(raw))
          if (payload) handleMessage(payload)
        } catch {
          // Ignore malformed payloads.
        }
      }

      activeSocket.onclose = () => {
        if (ws === activeSocket) ws = null
        clearHeartbeat()
        if (cancelled) return
        scheduleReconnect()
      }

      activeSocket.onerror = () => {
        disposeWebSocket(activeSocket)
        if (ws === activeSocket) ws = null
      }
    }

    // Defer the first connect so React StrictMode cleanup can cancel it
    // before the socket enters CONNECTING (avoids "closed before established").
    connectTimer = window.setTimeout(connect, 0)

    return () => {
      cancelled = true
      if (connectTimer !== null) window.clearTimeout(connectTimer)
      clearReconnectTimer()
      clearHeartbeat()
      disposeWebSocket(ws)
      ws = null
    }
  }, [])
}
