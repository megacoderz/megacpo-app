import { describe, expect, it } from 'vitest'

import { getNameInitials } from '@/utils/name-initials'

describe('getNameInitials', () => {
  it('returns first and last token initials', () => {
    expect(getNameInitials('Ana Silva')).toBe('AS')
    expect(getNameInitials('  João  Pedro  Souza  ')).toBe('JS')
  })

  it('returns single letter for one word', () => {
    expect(getNameInitials('Driver')).toBe('D')
  })

  it('returns question mark for empty name', () => {
    expect(getNameInitials('')).toBe('?')
    expect(getNameInitials(null)).toBe('?')
    expect(getNameInitials(undefined)).toBe('?')
  })
})
