import { useCallback, useState } from 'react'
import * as Linking from 'expo-linking'
import { useFocusEffect } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Button, Card, Screen } from '@/components/ui'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Spacing } from '@/constants/theme'
import { usePartnerAuth } from '@/hooks/use-partner-auth'
import { useTheme } from '@/hooks/use-theme'
import {
  partnerService,
  type PartnerConnectStatus,
} from '@/services/partner.service'
import { getApiErrorMessage } from '@/utils/api-error-message'
import { getNameInitials } from '@/utils/name-initials'

const CONNECT_STATUS_KEY: Record<string, string> = {
  connected: 'home.connect.connected',
  disconnected: 'home.connect.disconnected',
  error: 'home.connect.error',
  missing: 'home.connect.missing',
  pending: 'home.connect.pending',
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { partner, refreshMe } = usePartnerAuth()
  const [connectStatus, setConnectStatus] = useState<
    PartnerConnectStatus | undefined
  >()
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')

    try {
      const [, status] = await Promise.all([
        refreshMe(),
        partnerService.getConnectStatus(),
      ])
      setConnectStatus(status)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, t))
    } finally {
      setIsLoading(false)
    }
  }, [refreshMe, t])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const handleOnboarding = async () => {
    setIsOnboarding(true)
    setError('')

    try {
      const redirectUrl = Linking.createURL('/')
      const onboarding = await partnerService.startConnectOnboarding({
        refreshUrl: redirectUrl,
        returnUrl: redirectUrl,
      })
      await WebBrowser.openBrowserAsync(onboarding.authorizationUrl)
      await load()
    } catch (onboardingError) {
      setError(getApiErrorMessage(onboardingError, t))
    } finally {
      setIsOnboarding(false)
    }
  }

  if (isLoading) {
    return (
      <Screen scroll={false} style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
      </Screen>
    )
  }

  const statusKey = connectStatus
    ? (CONNECT_STATUS_KEY[connectStatus.status] ?? 'home.connect.missing')
    : 'home.connect.missing'
  const needsOnboarding = connectStatus?.status !== 'connected'

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.text }]}>
        {t('home.title')}
      </Text>

      <Card>
        <View style={styles.identity}>
          <ProfileAvatar
            avatarUrl={partner?.avatarUrl}
            initials={getNameInitials(partner?.name || partner?.email)}
            size="md"
          />
          <View style={styles.identityText}>
            {partner?.name ? (
              <Text style={[styles.value, { color: theme.text }]}>
                {partner.name}
              </Text>
            ) : null}
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {t('home.email')}
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {partner?.email ?? '-'}
            </Text>
          </View>
        </View>

        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('home.kind')}
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {partner ? t(`home.kindLabel.${partner.kind}`) : '-'}
          </Text>
        </View>

        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('home.status')}
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {partner ? t(`home.statusLabel.${partner.status}`) : '-'}
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('home.connect.title')}
        </Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {t(statusKey)}
        </Text>
        {connectStatus?.lastError ? (
          <Text style={[styles.error, { color: theme.danger }]}>
            {connectStatus.lastError}
          </Text>
        ) : null}
        {needsOnboarding ? (
          <Button
            loading={isOnboarding}
            onPress={() => void handleOnboarding()}
          >
            {t('home.connect.cta')}
          </Button>
        ) : null}
      </Card>

      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 13,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  identityText: {
    flex: 1,
    gap: Spacing.half,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
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
