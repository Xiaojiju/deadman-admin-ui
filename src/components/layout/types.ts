import { type LinkProps } from '@tanstack/react-router'
import { type PermissionInput } from '@/constants/permissions'

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type SidebarBrandData = Team

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  permission?: PermissionInput
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  brand: SidebarBrandData
  navGroups: NavGroup[]
}

export type {
  SidebarData,
  NavGroup,
  NavItem,
  NavCollapsible,
  NavLink,
  SidebarBrandData,
}
