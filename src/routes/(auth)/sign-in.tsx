import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { redirectIfAuthenticated } from '@/lib/auth-guard'
import { SignIn } from '@/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
  error: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    redirectIfAuthenticated(search.redirect || '/')
  },
  component: SignIn,
})
