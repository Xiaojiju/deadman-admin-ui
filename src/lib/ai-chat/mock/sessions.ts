import { createMessage, createMockAiChatState, createSession } from '../storage'

const WELCOME_MESSAGE = '你好呀，有什么我能帮你的吗？'

export function buildMockAiChatInitialState() {
  return createMockAiChatState([
    {
      title: '新对话',
      messages: [
        {
          role: 'assistant',
          content: WELCOME_MESSAGE,
        },
      ],
    },
    {
      title: '如何优化表格性能',
      messages: [
        {
          role: 'user',
          content: '列表页加载很慢，有什么优化建议？',
        },
        {
          role: 'assistant',
          content:
            '可以先检查分页大小、减少首屏列数，并对高频筛选字段加索引。若数据量较大，建议开启服务端排序与懒加载，同时排查是否存在 N+1 查询。',
        },
      ],
    },
    {
      title: '部门架构调整建议',
      messages: [
        {
          role: 'user',
          content: '我们要把销售和技术合并成一个事业部，系统里怎么调整？',
        },
        {
          role: 'assistant',
          content:
            '建议先在组织管理中调整部门层级，再批量更新相关用户的部门归属。完成后核对角色与数据范围，确保历史单据仍可被正确访问。',
        },
        {
          role: 'user',
          content: '那历史数据权限会受影响吗？',
        },
        {
          role: 'assistant',
          content:
            '如果启用了数据范围，调整后需要重新核对角色与数据范围配置。建议在变更前导出权限快照，并在测试环境先验证关键报表与审批流。',
        },
      ],
    },
  ])
}

export function buildMockWelcomeSession() {
  return createSession('新对话', [
    createMessage('assistant', WELCOME_MESSAGE, { status: 'complete' }),
  ])
}
