export type ChatAttachmentKind = 'image' | 'file'

export type ChatAttachment = {
  id: string
  kind: ChatAttachmentKind
  file: File
  name: string
  previewUrl?: string
}

export function createAttachmentId(): string {
  return crypto.randomUUID()
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function createAttachmentFromFile(file: File): ChatAttachment {
  const kind: ChatAttachmentKind = isImageFile(file) ? 'image' : 'file'
  return {
    id: createAttachmentId(),
    kind,
    file,
    name: file.name,
    previewUrl: kind === 'image' ? URL.createObjectURL(file) : undefined,
  }
}

export function revokeAttachmentPreview(attachment: ChatAttachment): void {
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl)
  }
}

export function revokeAttachmentPreviews(attachments: ChatAttachment[]): void {
  attachments.forEach(revokeAttachmentPreview)
}
