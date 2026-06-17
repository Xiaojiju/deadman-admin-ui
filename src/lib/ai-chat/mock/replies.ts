import type { AiChatMessage } from '../types'

const ATTACHMENT_PLACEHOLDER = '（附件）'

function normalizeQuestion(userContent: string): string {
  const trimmed = userContent.trim()
  return trimmed || ATTACHMENT_PLACEHOLDER
}

export function buildMockThinking(question: string): string {
  return `收到问题：「${question}」

【Step 1】理解用户意图
- 识别问题所属领域（产品 / 技术 / 流程 / 数据分析）
- 判断用户当前处于哪个页面或业务上下文
- 确认用户期望得到的是解释、步骤还是决策建议

【Step 2】拆解关键约束
- 现有模块之间的依赖关系（组织、权限、角色、数据范围）
- 操作影响面：仅当前用户、当前部门还是全局配置
- 是否存在历史数据、审计要求或合规限制

【Step 3】检索与对比可行方案
- 方案 A：最小改动，优先保证现有流程可用
- 方案 B：结构化调整，适合中长期维护
- 方案 C：一次性重构，适合明确迁移窗口的场景
- 评估各方案的实施成本、风险与回滚难度

【Step 4】组织回答结构
- 先用一句话给出结论，降低阅读成本
- 再给出可执行的分步骤建议
- 最后补充注意事项、验证方式与可继续追问的方向

【Step 5】模拟自检
- 回复是否直接回应了「${question}」
- 是否避免无关扩展
- 是否保留后续接入真实 AI / 工具链的扩展空间`
}

export function buildMockReplyContent(question: string): string {
  return `关于「${question}」，建议按以下步骤推进：

1. 先明确当前页面/模块的业务目标与成功标准
2. 梳理涉及的角色、数据与权限边界，避免误操作
3. 选择影响面最小的改造路径，分阶段验证结果

如果你愿意补充具体场景（例如页面路径、角色、期望结果），我可以继续给出更细的操作清单。`
}

export function buildMockAssistantMessage(
  userContent: string,
  thinkingEnabled: boolean
): Pick<AiChatMessage, 'content' | 'thinking' | 'status' | 'thinkingCollapsed'> {
  const question = normalizeQuestion(userContent)

  return {
    content: buildMockReplyContent(question),
    thinking: thinkingEnabled ? buildMockThinking(question) : undefined,
    status: 'streaming',
    thinkingCollapsed: false,
  }
}
