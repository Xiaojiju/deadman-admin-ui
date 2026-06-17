import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { WechatCallback } from '@/features/auth/wechat/callback'

const searchSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/auth/wechat/callback')({
  validateSearch: searchSchema,
  component: WechatCallback,
})
