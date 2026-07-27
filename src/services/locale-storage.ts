import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  getDeviceLocale,
  isSupportedLocale,
  type SupportedLocale,
} from '@/i18n/locale-utils'

const LOCALE_STORAGE_KEY = '@megapartner/locale'

export const localeStorage = {
  get: async (): Promise<SupportedLocale | null> => {
    const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : null
  },

  save: async (locale: SupportedLocale) => {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale)
  },

  clear: async () => {
    await AsyncStorage.removeItem(LOCALE_STORAGE_KEY)
  },

  resolveInitial: async (): Promise<SupportedLocale> => {
    const stored = await localeStorage.get()
    return stored ?? getDeviceLocale()
  },
}
