export const DEADMAN_COMPONENT_CODES = {
  CLIENT: 'client',
} as const

export type DeadmanComponentCode =
  (typeof DEADMAN_COMPONENT_CODES)[keyof typeof DEADMAN_COMPONENT_CODES]
