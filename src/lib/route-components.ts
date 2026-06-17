import { normalizeRoutePath } from '@/lib/route-permissions'
import { DEADMAN_COMPONENT_CODES } from '@/constants/components'

/**
 * 路由 → 所需服务端组件编码。
 * 未列出的路径视为内置默认路由，不做组件校验。
 * 新增依赖 optional 组件的 sidebar 路由时，在此同步注册。
 */
export const ROUTE_COMPONENT_MAP: Record<string, string> = {
  '/client/users': DEADMAN_COMPONENT_CODES.CLIENT,
}

export function getRouteRequiredComponent(
  pathname: string
): string | undefined {
  return ROUTE_COMPONENT_MAP[normalizeRoutePath(pathname)]
}
