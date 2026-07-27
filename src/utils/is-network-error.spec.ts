import { describe, expect, it } from 'vitest'

import { isNetworkError } from '@/utils/is-network-error'

describe('isNetworkError', () => {
  it('detects fetch failures', () => {
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isNetworkError(new Error('Network request failed'))).toBe(true)
  })

  it('ignores abort errors', () => {
    const error = new Error('aborted')
    error.name = 'AbortError'
    expect(isNetworkError(error)).toBe(false)
  })

  it('returns false for unrelated errors', () => {
    expect(isNetworkError(new Error('validation failed'))).toBe(false)
  })

  it('returns false for non-error values', () => {
    expect(isNetworkError('boom')).toBe(false)
  })
})
