import Constants from 'expo-constants'

type ExpoExtra = {
  apiUrl?: string
  appDisplayName?: string
  primaryColor?: string
}

const extra = (Constants.expoConfig?.extra ??
  Constants.manifest2?.extra ??
  {}) as ExpoExtra

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
  apiUrl: resolveApiUrl(),
  appDisplayName:
    process.env.EXPO_PUBLIC_APP_DISPLAY_NAME ??
    extra.appDisplayName ??
    'Mega Partner',
  primaryColor:
    process.env.EXPO_PUBLIC_PRIMARY_COLOR ?? extra.primaryColor ?? '#0284c7',
} as const
