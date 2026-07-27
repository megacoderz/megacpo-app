import * as Localization from 'expo-localization'

export const DEFAULT_LOCALE = 'pt-BR'
export const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const normalizeLocale = (locale?: string | null): SupportedLocale => {
  if (!locale) {
    return DEFAULT_LOCALE
  }

  const normalized = locale.toLowerCase()

  if (normalized.startsWith('en')) {
    return 'en-US'
  }

  if (normalized.startsWith('es')) {
    return 'es-ES'
  }

  if (normalized.startsWith('pt')) {
    return 'pt-BR'
  }

  return DEFAULT_LOCALE
}

export const getDeviceLocale = () =>
  normalizeLocale(Localization.getLocales()[0]?.languageTag)

export const isSupportedLocale = (
  value: string | null | undefined,
): value is SupportedLocale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as SupportedLocale))
