import { Linking, Platform, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Button, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

const STORE_URL_IOS = process.env.EXPO_PUBLIC_STORE_URL_IOS?.trim() ?? ''
const STORE_URL_ANDROID =
  process.env.EXPO_PUBLIC_STORE_URL_ANDROID?.trim() ?? ''

/**
 * Last-release gate for the legacy …megacpo.app listing.
 * Enable with EXPO_PUBLIC_FORCE_UPGRADE=1 on the sunset build only.
 */
export const isForceUpgradeEnabled = () =>
  process.env.EXPO_PUBLIC_FORCE_UPGRADE === '1'

export const ForceUpgradeScreen = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const handleOpenStore = async () => {
    const url =
      (Platform.OS === 'ios' ? STORE_URL_IOS : STORE_URL_ANDROID) ||
      STORE_URL_IOS ||
      STORE_URL_ANDROID
    if (!url) {
      return
    }
    await Linking.openURL(url)
  }

  return (
    <Screen style={styles.root}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('forceUpgrade.title')}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {t('forceUpgrade.body')}
        </Text>
        <Button
          disabled={!STORE_URL_IOS && !STORE_URL_ANDROID}
          onPress={() => {
            void handleOpenStore()
          }}
        >
          {t('forceUpgrade.cta')}
        </Button>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
})
