import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  APPEARANCE_PREFERENCES,
  type AppearancePreference,
} from '@/theme/color-scheme'

const APPEARANCE_STORAGE_KEY = '@megapartner/appearance'

const isAppearancePreference = (
  value: string | null,
): value is AppearancePreference =>
  Boolean(
    value && APPEARANCE_PREFERENCES.includes(value as AppearancePreference),
  )

export const appearanceStorage = {
  get: async (): Promise<AppearancePreference | null> => {
    const stored = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)
    return isAppearancePreference(stored) ? stored : null
  },

  save: async (preference: AppearancePreference) => {
    await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, preference)
  },

  clear: async () => {
    await AsyncStorage.removeItem(APPEARANCE_STORAGE_KEY)
  },

  resolveInitial: async (): Promise<AppearancePreference> => {
    const stored = await appearanceStorage.get()
    return stored ?? 'system'
  },
}
