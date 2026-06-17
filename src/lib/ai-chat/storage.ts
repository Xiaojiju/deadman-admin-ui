import type { AiChatMessage, AiChatSession, AiChatState } from './types'
import { buildMockAiChatInitialState } from './mock'

export const AI_CHAT_STORAGE_KEY = 'deadman-ai-chat-sessions'

export function createMessageId(): string {
  return crypto.randomUUID()
}

export function createSessionId(): string {
  return crypto.randomUUID()
}

export function truncateTitle(text: string, maxLength = 24): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength)}…`
}

export function loadAiChatState(): AiChatState | null {
  try {
    const raw = localStorage.getItem(AI_CHAT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AiChatState
    if (!parsed.activeSessionId || !Array.isArray(parsed.sessions)) return null
    if (parsed.sessions.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

export function saveAiChatState(state: AiChatState): void {
  localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(state))
}

export function createSession(
  title: string,
  messages: AiChatMessage[] = []
): AiChatSession {
  const now = new Date().toISOString()
  return {
    id: createSessionId(),
    title,
    messages,
    createdAt: now,
    updatedAt: now,
  }
}

export function createMessage(
  role: AiChatMessage['role'],
  content: string,
  extra?: Partial<AiChatMessage>
): AiChatMessage {
  return {
    id: createMessageId(),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  }
}

type MockSessionInput = {
  title: string
  messages: Array<{ role: AiChatMessage['role']; content: string }>
}

export function createMockAiChatState(
  sessions: MockSessionInput[]
): AiChatState {
  const built = sessions.map((session) => {
    const messages = session.messages.map((message) =>
      createMessage(message.role, message.content, {
        status: message.role === 'assistant' ? 'complete' : undefined,
      })
    )
    const created = createSession(session.title, messages)
    if (messages.length > 0) {
      created.updatedAt = messages[messages.length - 1].createdAt
    }
    return created
  })

  return {
    activeSessionId: built[0].id,
    sessions: built,
  }
}

export function upsertSession(
  state: AiChatState,
  session: AiChatSession
): AiChatState {
  const index = state.sessions.findIndex((item) => item.id === session.id)
  const sessions =
    index === -1
      ? [session, ...state.sessions]
      : state.sessions.map((item, i) => (i === index ? session : item))

  return {
    activeSessionId: session.id,
    sessions: sortSessionsByUpdatedAt(sessions),
  }
}

export function sortSessionsByUpdatedAt(
  sessions: AiChatSession[]
): AiChatSession[] {
  return [...sessions].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getSessionPreview(session: AiChatSession): string {
  const last = session.messages[session.messages.length - 1]
  return last?.content ?? ''
}

function hasUntranslatedContent(state: AiChatState): boolean {
  return state.sessions.some((session) =>
    session.messages.some(
      (message) =>
        message.content.startsWith('aiChat.') ||
        session.title.startsWith('aiChat.')
    )
  )
}

export function buildDefaultAiChatState(): AiChatState {
  return buildMockAiChatInitialState()
}

export function resolveAiChatState(): AiChatState {
  const loaded = loadAiChatState()
  if (loaded && !hasUntranslatedContent(loaded)) return loaded
  return buildDefaultAiChatState()
}
