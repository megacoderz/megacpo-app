import { describe, expect, it } from 'vitest'

import {
  requestMagicLinkSchema,
  verifyTokenSchema,
} from '@/schemas/partner-auth.schema'

describe('requestMagicLinkSchema', () => {
  it('accepts a valid email', () => {
    const result = requestMagicLinkSchema.safeParse({
      email: 'partner@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = requestMagicLinkSchema.safeParse({ email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('trims surrounding whitespace', () => {
    const result = requestMagicLinkSchema.safeParse({
      email: '  partner@example.com  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('partner@example.com')
    }
  })
})

describe('verifyTokenSchema', () => {
  it('accepts a non-empty token', () => {
    expect(verifyTokenSchema.safeParse({ token: 'abc123' }).success).toBe(true)
  })

  it('rejects an empty token', () => {
    expect(verifyTokenSchema.safeParse({ token: '' }).success).toBe(false)
  })
})
