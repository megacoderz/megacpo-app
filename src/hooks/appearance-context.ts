import { createContext } from 'react'

import type { AppearancePreference, ColorScheme } from '@/theme/color-scheme'

export type AppearanceContextValue = {
  isReady: boolean
  preference: AppearancePreference
  scheme: ColorScheme
  setPreference: (preference: AppearancePreference) => Promise<void>
}

export const AppearanceContext = createContext<
  AppearanceContextValue | undefined
>(undefined)
