import { describe, expect, it, vi } from 'vitest'

vi.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'en-US' }],
}))

import {
  DEFAULT_LOCALE,
  getDeviceLocale,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from '@/i18n/locale-utils'

describe('locale-utils', () => {
  it('exposes supported locales with pt-BR as default', () => {
    expect(SUPPORTED_LOCALES).toContain('pt-BR')
    expect(DEFAULT_LOCALE).toBe('pt-BR')
  })

  it('normalizes the device locale from expo-localization', () => {
    expect(getDeviceLocale()).toBe('en-US')
  })

  it('validates supported locales', () => {
    expect(isSupportedLocale('pt-BR')).toBe(true)
    expect(isSupportedLocale('fr-FR')).toBe(false)
    expect(isSupportedLocale(undefined)).toBe(false)
  })
})
