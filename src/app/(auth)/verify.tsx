import { useCallback, useRef, useState } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Button, Card, Input, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { usePartnerAuth } from '@/hooks/use-partner-auth'
import { useTheme } from '@/hooks/use-theme'
import { getApiErrorMessage } from '@/utils/api-error-message'

type VerifyStatus = 'idle' | 'loading' | 'error'

export default function VerifyScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { verify } = usePartnerAuth()
  const params = useLocalSearchParams<{ token?: string }>()
  const initialToken = Array.isArray(params.token)
    ? params.token[0]
    : params.token
  const [token, setToken] = useState(initialToken ?? '')
  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [error, setError] = useState('')
  const hasAutoVerifiedRef = useRef(false)

  const handleVerify = async (candidate: string) => {
    const trimmed = candidate.trim()

    if (!trimmed) {
      return
    }

    setStatus('loading')
    setError('')

    try {
      await verify(trimmed)
      // PartnerAuthGate redirects into the app once isAuthenticated flips true.
    } catch (verifyError) {
      setStatus('error')
      setError(getApiErrorMessage(verifyError, t, 'auth.verifyError'))
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (initialToken && !hasAutoVerifiedRef.current) {
        hasAutoVerifiedRef.current = true
        void handleVerify(initialToken)
      }
      // Only run once for the initial deep-link token.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialToken]),
  )

  if (status === 'loading' || (Boolean(initialToken) && status === 'idle')) {
    return (
      <Screen scroll={false} style={styles.center}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {t('auth.verifying')}
        </Text>
      </Screen>
    )
  }

  return (
    <Screen style={styles.content}>
      <Card>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('auth.verifyTitle')}
        </Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {t('auth.verifySubtitle')}
        </Text>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          label={t('auth.tokenLabel')}
          onChangeText={setToken}
          value={token}
        />
        {error ? (
          <Text style={[styles.message, { color: theme.danger }]}>{error}</Text>
        ) : null}
        <Button onPress={() => void handleVerify(token)}>
          {t('auth.verifyAction')}
        </Button>
        <Button onPress={() => router.replace('/login')} variant="ghost">
          {t('common.back')}
        </Button>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
})
