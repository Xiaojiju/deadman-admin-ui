import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildMockAssistantMessage, buildMockWelcomeSession } from '@/lib/ai-chat/mock'
import type {
  AiChatMessage,
  AiChatSession,
  AiChatState,
  SendMessageOptions,
} from '@/lib/ai-chat/types'
import {
  createMessage,
  resolveAiChatState,
  saveAiChatState,
  sortSessionsByUpdatedAt,
  truncateTitle,
  upsertSession,
} from '@/lib/ai-chat/storage'

export function useAiChatSessions() {
  const { t } = useTranslation('layout')
  const [state, setState] = useState<AiChatState>(() => resolveAiChatState())

  useEffect(() => {
    saveAiChatState(state)
  }, [state])

  const sessions = useMemo(
    () => sortSessionsByUpdatedAt(state.sessions),
    [state.sessions]
  )

  const activeSession = useMemo(() => {
    const found = state.sessions.find(
      (session) => session.id === state.activeSessionId
    )
    return found ?? sessions[0] ?? null
  }, [state.activeSessionId, state.sessions, sessions])

  const createNewChat = useCallback(() => {
    const session = buildMockWelcomeSession()

    setState((prev) => ({
      activeSessionId: session.id,
      sessions: sortSessionsByUpdatedAt([session, ...prev.sessions]),
    }))

    return session.id
  }, [])

  const selectSession = useCallback((sessionId: string) => {
    setState((prev) => ({
      ...prev,
      activeSessionId: sessionId,
    }))
  }, [])

  const updateMessage = useCallback(
    (
      sessionId: string,
      messageId: string,
      patch: Partial<AiChatMessage>
    ) => {
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((session) => {
          if (session.id !== sessionId) return session
          return {
            ...session,
            messages: session.messages.map((message) =>
              message.id === messageId ? { ...message, ...patch } : message
            ),
          }
        }),
      }))
    },
    []
  )

  const sendMessage = useCallback(
    (content: string, options: SendMessageOptions = {}) => {
      const trimmed = content.trim()
      if (!trimmed || !activeSession) return

      const { thinkingEnabled = false } = options
      const userMessage = createMessage('user', trimmed)
      const mockReply = buildMockAssistantMessage(trimmed, thinkingEnabled)
      const assistantMessage = createMessage('assistant', mockReply.content, {
        thinking: mockReply.thinking,
        status: mockReply.status,
        thinkingCollapsed: mockReply.thinkingCollapsed,
      })
      const now = assistantMessage.createdAt

      const isDefaultTitle = activeSession.title === t('aiChat.newChatTitle')
      const nextTitle = isDefaultTitle
        ? truncateTitle(trimmed)
        : activeSession.title

      const updatedSession: AiChatSession = {
        ...activeSession,
        title: nextTitle,
        messages: [
          ...activeSession.messages,
          userMessage,
          assistantMessage,
        ],
        updatedAt: now,
      }

      setState((prev) => upsertSession(prev, updatedSession))
    },
    [activeSession, t]
  )

  return {
    sessions,
    activeSession,
    createNewChat,
    selectSession,
    sendMessage,
    updateMessage,
  }
}
