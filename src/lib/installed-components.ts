import { useAuthStore } from '@/stores/auth-store'

export function getInstalledComponentCodes(): string[] {
  return useAuthStore.getState().auth.installedComponentCodes
}

export function hasInstalledComponent(code: string): boolean {
  return getInstalledComponentCodes().includes(code)
}

export function toInstalledComponentSet(codes: string[]): ReadonlySet<string> {
  return new Set(codes)
}
