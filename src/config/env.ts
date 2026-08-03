import Constants from 'expo-constants'

type ExpoExtra = {
  apiUrl?: string
  appDisplayName?: string
  primaryColor?: string
  appEnv?: string
}

const DEFAULT_PRIMARY_COLOR = '#0284c7'

const extra = (Constants.expoConfig?.extra ??
  Constants.manifest2?.extra ??
  {}) as ExpoExtra

const isHexColor = (value: string): boolean =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)

/** `.env` sem aspas: `#0284c7` vira comentário e a cor chega vazia. */
const resolvePrimaryColor = (): string => {
  const candidates = [process.env.EXPO_PUBLIC_PRIMARY_COLOR, extra.primaryColor]

  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value && isHexColor(value)) {
      return value
    }
  }

  return DEFAULT_PRIMARY_COLOR
}

const resolveApiUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim()
  if (fromEnv) {
    return fromEnv
  }

  const fromExtra = extra.apiUrl?.trim()
  if (fromExtra) {
    return fromExtra
  }

  if (__DEV__) {
    return 'http://localhost:3001'
  }

  return ''
}

export const env = {
  appEnv: process.env.APP_ENV ?? extra.appEnv ?? 'development',
  apiUrl: resolveApiUrl(),
  appDisplayName:
    process.env.EXPO_PUBLIC_APP_DISPLAY_NAME?.trim() ||
    extra.appDisplayName?.trim() ||
    'Mega Partner',
  primaryColor: resolvePrimaryColor(),
  sentryEnabled:
    process.env.EXPO_PUBLIC_SENTRY_ENABLED === 'true' ||
    process.env.EXPO_PUBLIC_SENTRY_ENABLED === '1',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  sentryEnvironment:
    process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
} as const
