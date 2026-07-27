import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { Card, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { useAppearance } from '@/hooks/appearance-provider'
import { useTheme } from '@/hooks/use-theme'
import {
  APPEARANCE_PREFERENCES,
  type AppearancePreference,
} from '@/theme/color-scheme'

export default function AppearanceScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { preference, setPreference } = useAppearance()

  return (
    <Screen>
      <Stack.Screen options={{ title: t('profile.appearance') }} />
      <Card>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {t('profile.menu.appearance.subtitle')}
        </Text>
        <View>
          {APPEARANCE_PREFERENCES.map((option, index) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: preference === option }}
              key={option}
              onPress={() => void setPreference(option as AppearancePreference)}
              style={[
                styles.row,
                index < APPEARANCE_PREFERENCES.length - 1 && {
                  borderBottomColor: theme.border,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              <Text style={[styles.label, { color: theme.text }]}>
                {t(`profile.appearanceOptions.${option}`)}
              </Text>
              {preference === option ? (
                <Text style={{ color: theme.primary, fontWeight: '800' }}>
                  {t('profile.selected')}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
})
