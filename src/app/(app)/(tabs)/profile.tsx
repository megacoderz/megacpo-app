import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Button, Card, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { usePartnerAuth } from '@/hooks/use-partner-auth'
import { useTheme } from '@/hooks/use-theme'
import {
  changeAppLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n'

export default function ProfileScreen() {
  const { i18n, t } = useTranslation()
  const theme = useTheme()
  const { logout, partner } = usePartnerAuth()

  const handleLogout = () => {
    void logout().then(() => router.replace('/login'))
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.text }]}>
        {t('profile.title')}
      </Text>

      <Card>
        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('profile.email')}
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {partner?.email ?? '-'}
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('profile.language')}
        </Text>
        {SUPPORTED_LOCALES.map((locale: SupportedLocale) => (
          <Button
            key={locale}
            onPress={() => void changeAppLocale(locale)}
            variant={i18n.language === locale ? 'primary' : 'secondary'}
          >
            {t(`profile.locale.${locale}`)}
          </Button>
        ))}
      </Card>

      <Card>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/appearance')}
          style={styles.menuRow}
        >
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('profile.appearance')}
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {t('profile.menu.appearance.subtitle')}
            </Text>
          </View>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>›</Text>
        </Pressable>
      </Card>

      <Button onPress={handleLogout} variant="danger">
        {t('auth.logout')}
      </Button>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
})
