import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/services/api-client'
import { getApiErrorMessage } from '@/utils/api-error-message'

const t = ((key: string) => key) as import('i18next').TFunction

describe('getApiErrorMessage', () => {
  it('maps known API error codes to i18n keys', () => {
    const error = new ApiClientError(
      'raw message',
      401,
      'PARTNER_SESSION_INVALID',
    )
    expect(getApiErrorMessage(error, t)).toBe('auth.sessionExpired')
  })

  it('falls back to the raw API message when the code is unknown', () => {
    const error = new ApiClientError('custom message', 400, 'SOME_OTHER_CODE')
    expect(getApiErrorMessage(error, t)).toBe('custom message')
  })

  it('falls back to the provided fallback key for unknown errors', () => {
    expect(getApiErrorMessage(new Error(''), t, 'common.error')).toBe(
      'common.error',
    )
  })

  it('returns the error message for plain errors with content', () => {
    expect(getApiErrorMessage(new Error('boom'), t)).toBe('boom')
  })
})
