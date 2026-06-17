import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { WechatBind } from '@/features/auth/sign-in/wechat-bind'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in/wechat-bind')({
  validateSearch: searchSchema,
  component: WechatBind,
})
