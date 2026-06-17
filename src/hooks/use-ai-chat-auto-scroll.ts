import { useCallback, useEffect, useRef } from 'react'

export function useAiChatAutoScroll(
  messages: unknown[],
  sessionId?: string,
  enabled = true
) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    if (!enabled) return
    scrollToBottom()
  }, [enabled, messages, sessionId, scrollToBottom])

  return { bottomRef, scrollToBottom }
}
