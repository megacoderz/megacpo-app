import { z } from 'zod'

export const requestMagicLinkSchema = z.object({
  email: z
    .string()
    .trim()
    .email('auth.validation.email')
    .max(255, 'auth.validation.email'),
})

export type RequestMagicLinkInput = z.infer<typeof requestMagicLinkSchema>

export const verifyTokenSchema = z.object({
  token: z.string().trim().min(1, 'auth.validation.token'),
})

export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>
