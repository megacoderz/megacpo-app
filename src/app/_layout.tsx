import { Fragment, useEffect, useMemo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { ThemeProvider as NavigationThemeProvider, Slot } from 'expo-router'
import * as SystemUI from 'expo-system-ui'
import { StatusBar } from 'expo-status-bar'

import i18n, { hydrateAppLocale } from '@/i18n'
import {
  ForceUpgradeScreen,
  isForceUpgradeEnabled,
} from '@/components/force-upgrade-screen'
import { AppearanceProvider } from '@/hooks/appearance-provider'
import { useAppColorScheme } from '@/hooks/use-app-color-scheme'
import { PartnerAuthGate, PartnerAuthProvider } from '@/hooks/use-partner-auth'
import { useTheme } from '@/hooks/use-theme'
import { initSentry } from '@/infrastructure/sentry/sentry'
import { buildNavigationTheme } from '@/theme/navigation-theme'

const SystemUiSync = () => {
  const theme = useTheme()

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.background)
  }, [theme.background])

  return null
}

const RootProviders = () => {
  const colorScheme = useAppColorScheme()
  const navigationTheme = useMemo(
    () => buildNavigationTheme(colorScheme),
    [colorScheme],
  )

  if (isForceUpgradeEnabled()) {
    return (
      <NavigationThemeProvider value={navigationTheme}>
        <SystemUiSync />
        <ForceUpgradeScreen />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    )
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <PartnerAuthProvider>
        <Fragment>
          <SystemUiSync />
          <PartnerAuthGate>
            <Slot />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </PartnerAuthGate>
        </Fragment>
      </PartnerAuthProvider>
    </NavigationThemeProvider>
  )
}

export default function RootLayout() {
  const [isLocaleReady, setIsLocaleReady] = useState(false)

  useEffect(() => {
    initSentry()
    void hydrateAppLocale().finally(() => setIsLocaleReady(true))
  }, [])

  if (!isLocaleReady) {
    return null
  }

  return (
    <I18nextProvider i18n={i18n}>
      <KeyboardProvider>
        <AppearanceProvider>
          <RootProviders />
        </AppearanceProvider>
      </KeyboardProvider>
    </I18nextProvider>
  )
}
