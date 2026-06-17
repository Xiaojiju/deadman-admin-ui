export function clearSessionStorage(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.clear()
}
