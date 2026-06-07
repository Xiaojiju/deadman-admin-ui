import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Header } from './header'

type PageLayoutProps = {
  children: React.ReactNode
  fixed?: boolean
  /** 顶栏左侧区域，默认搜索框 */
  headerLeading?: React.ReactNode
}

export function PageLayout({
  children,
  fixed = true,
  headerLeading,
}: PageLayoutProps) {
  return (
    <>
      <Header fixed={fixed}>
        {headerLeading ?? <Search className='me-auto' />}
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>
      {children}
    </>
  )
}
