import { describe, expect, it } from 'vitest'

import {
  resolveColorScheme,
  resolveEffectiveColorScheme,
} from '@/theme/color-scheme'

describe('color-scheme', () => {
  it('resolveColorScheme defaults to light', () => {
    expect(resolveColorScheme(null)).toBe('light')
    expect(resolveColorScheme('dark')).toBe('dark')
  })

  it('resolveEffectiveColorScheme respects preference', () => {
    expect(resolveEffectiveColorScheme('system', 'dark')).toBe('dark')
    expect(resolveEffectiveColorScheme('light', 'dark')).toBe('light')
    expect(resolveEffectiveColorScheme('dark', 'light')).toBe('dark')
  })
})
