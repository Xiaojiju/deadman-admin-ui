import { redirect } from '@tanstack/react-router'
import { hasInstalledComponent } from '@/lib/installed-components'
import { getRouteRequiredComponent } from '@/lib/route-components'

/** 访问路径所需组件未装配时跳转 404 */
export function requireRouteComponent(pathname: string) {
  const required = getRouteRequiredComponent(pathname)
  if (!required) return

  if (!hasInstalledComponent(required)) {
    throw redirect({ to: '/404' })
  }
}
