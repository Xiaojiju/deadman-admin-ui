import { AiChatToggle } from '@/components/ai-chat/ai-chat-toggle'
import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import { Header } from './header'

type PageLayoutProps = {
  children: React.ReactNode
  fixed?: boolean
  /** 顶栏左侧区域，默认搜索框 */
  headerLeading?: React.ReactNode
  /** AI 聊天按钮位置：header 向下弹出，footer 向上弹出 */
  chatPlacement?: 'header' | 'footer'
  /** 点击空白处是否关闭 AI 对话框，默认 false */
  chatDismissOnOutsideClick?: boolean
}

export function PageLayout({
  children,
  fixed = true,
  headerLeading,
  chatPlacement = 'header',
  chatDismissOnOutsideClick = false,
}: PageLayoutProps) {
  const chatSide = chatPlacement === 'header' ? 'bottom' : 'top'
  const chatToggle = (
    <AiChatToggle
      side={chatSide}
      dismissOnOutsideClick={chatDismissOnOutsideClick}
    />
  )

  return (
    <>
      <Header fixed={fixed}>
        {headerLeading ?? <Search className='me-auto' />}
        <ThemeSwitch />
        <ConfigDrawer />
        {chatPlacement === 'header' && chatToggle}
      </Header>
      {children}
      {chatPlacement === 'footer' && (
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-end p-4',
            'max-md:bottom-[calc(env(safe-area-inset-bottom)+0.5rem)]'
          )}
        >
          <div className='pointer-events-auto'>{chatToggle}</div>
        </div>
      )}
    </>
  )
}
