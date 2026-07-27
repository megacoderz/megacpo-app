import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enUS from '@/locales/en-US.json'
import esES from '@/locales/es-ES.json'
import ptBR from '@/locales/pt-BR.json'
import {
  DEFAULT_LOCALE,
  getDeviceLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n/locale-utils'
import { localeStorage } from '@/services/locale-storage'

export {
  DEFAULT_LOCALE,
  getDeviceLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n/locale-utils'

export const changeAppLocale = async (locale: SupportedLocale) => {
  await i18n.changeLanguage(locale)
  await localeStorage.save(locale)
}

export const hydrateAppLocale = async () => {
  const locale = await localeStorage.resolveInitial()
  await i18n.changeLanguage(locale)
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    fallbackLng: DEFAULT_LOCALE,
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    lng: getDeviceLocale(),
    react: {
      useSuspense: false,
    },
    resources: {
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
      'pt-BR': { translation: ptBR },
    },
    supportedLngs: [...SUPPORTED_LOCALES],
  })
}

export default i18n
