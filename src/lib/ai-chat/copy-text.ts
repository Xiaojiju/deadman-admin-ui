import { toast } from 'sonner'

export async function copyChatText(
  text: string,
  messages: { success: string; failed: string }
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(messages.success)
  } catch {
    toast.error(messages.failed)
  }
}

function getAvatarFallback(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.slice(0, 1)
}

export { getAvatarFallback }
