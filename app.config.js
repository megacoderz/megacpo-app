/** @typedef {import('expo/config').ExpoConfig} ExpoConfig */

const appJson = require('./app.json')

const EAS_OWNER = 'megacoderz'
const EAS_PROJECT_ID = 'ae96404c-da46-467f-937b-85dbdf63bbfe'

const displayName =
  process.env.EXPO_PUBLIC_APP_DISPLAY_NAME?.trim() || 'Mega Partner'
const isHexColor = (value) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)

const primaryColor = (() => {
  const raw = process.env.EXPO_PUBLIC_PRIMARY_COLOR?.trim()
  return raw && isHexColor(raw) ? raw : '#0284c7'
})()

/** Avaliado na hora do prebuild (após @expo/env carregar `.env`). */
const isPersonalTeamDev = () => process.env.EXPO_IOS_PERSONAL_TEAM === '1'

/** Bundle de produção costuma estar na conta paga — Personal Team precisa de ID próprio. */
const personalTeamBundleId = () =>
  process.env.EXPO_IOS_BUNDLE_IDENTIFIER ??
  `${appJson.expo.ios.bundleIdentifier}.dev`

/** @returns {Partial<NonNullable<ExpoConfig['ios']>>} */
const personalTeamIosOverrides = () => {
  if (!isPersonalTeamDev()) {
    return {}
  }

  return {
    bundleIdentifier: personalTeamBundleId(),
    associatedDomains: [],
    ...(process.env.EXPO_IOS_APPLE_TEAM_ID
      ? { appleTeamId: process.env.EXPO_IOS_APPLE_TEAM_ID }
      : {}),
  }
}

/** @returns {NonNullable<ExpoConfig['plugins']>} */
const buildPlugins = () => {
  // Mantém `react-native-keyboard-controller` só como dependência nativa
  // (autolinking + KeyboardProvider). Não listar em `plugins`.
  // Sentry: só runtime (`Sentry.init` + EXPO_PUBLIC_SENTRY_*).
  // Não listar `@sentry/react-native` em plugins — exige organization/project
  // (ou SENTRY_ORG/SENTRY_PROJECT) e gera warning no `expo run:ios` local.
  return [
    ...(appJson.expo.plugins ?? []),
    'expo-image',
    'expo-localization',
    'expo-secure-store',
  ]
}

/** @type {(ctx: import('expo/config').ConfigContext) => ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  ...appJson.expo,
  name: displayName,
  owner: EAS_OWNER,
  userInterfaceStyle: 'automatic',
  ios: {
    ...appJson.expo.ios,
    ...config.ios,
    ...personalTeamIosOverrides(),
  },
  android: {
    ...appJson.expo.android,
    ...config.android,
  },
  plugins: [
    ...(buildPlugins() ?? []),
    ...(isPersonalTeamDev() ? ['./plugins/with-personal-team-ios'] : []),
  ],
  extra: {
    ...appJson.expo.extra,
    ...config.extra,
    router: {},
    eas: {
      projectId: EAS_PROJECT_ID,
    },
    primaryColor,
    appEnv: process.env.APP_ENV ?? 'development',
  },
})
