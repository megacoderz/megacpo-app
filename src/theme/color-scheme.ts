export type ColorScheme = 'light' | 'dark'

export type AppearancePreference = 'system' | 'light' | 'dark'

export const APPEARANCE_PREFERENCES = [
  'system',
  'light',
  'dark',
] as const satisfies readonly AppearancePreference[]

export const resolveColorScheme = (
  scheme: string | null | undefined,
): ColorScheme => (scheme === 'dark' ? 'dark' : 'light')

export const resolveEffectiveColorScheme = (
  preference: AppearancePreference,
  systemScheme: string | null | undefined,
): ColorScheme => {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }

  return resolveColorScheme(systemScheme)
}
