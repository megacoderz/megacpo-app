import { DarkTheme, DefaultTheme } from 'expo-router'

import { Colors } from '@/constants/theme'
import type { ColorScheme } from '@/theme/color-scheme'

export type { ColorScheme } from '@/theme/color-scheme'
export { resolveColorScheme } from '@/theme/color-scheme'

export const buildNavigationTheme = (scheme: ColorScheme) => {
  const palette = Colors[scheme]
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme

  return {
    ...base,
    colors: {
      ...base.colors,
      background: palette.background,
      border: palette.border,
      card: palette.card,
      notification: palette.primary,
      primary: palette.primary,
      text: palette.text,
    },
  }
}
