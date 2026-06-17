export type AiChatRole = 'user' | 'assistant'

export type AiChatMessageStatus = 'streaming' | 'complete'

export type AiChatMessage = {
  id: string
  role: AiChatRole
  content: string
  createdAt: string
  /** 思考过程正文 */
  thinking?: string
  /** 思考完成后是否默认收起 */
  thinkingCollapsed?: boolean
  /** streaming：正在打字机播放；complete：已结束 */
  status?: AiChatMessageStatus
}

export type AiChatSession = {
  id: string
  title: string
  messages: AiChatMessage[]
  createdAt: string
  updatedAt: string
}

export type AiChatState = {
  activeSessionId: string
  sessions: AiChatSession[]
}

export type SendMessageOptions = {
  thinkingEnabled?: boolean
}
