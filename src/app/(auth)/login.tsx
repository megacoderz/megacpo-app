import { useState } from 'react'
import { router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Button, Card, Input, Screen } from '@/components/ui'
import { env } from '@/config/env'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { requestMagicLinkSchema } from '@/schemas/partner-auth.schema'
import { partnerService } from '@/services/partner.service'
import { getApiErrorMessage } from '@/utils/api-error-message'

export default function LoginScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [emailError, setEmailError] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [isSendingLink, setIsSendingLink] = useState(false)

  const handleRequestLink = async () => {
    const parsed = requestMagicLinkSchema.safeParse({ email })

    if (!parsed.success) {
      setEmailError(
        t(parsed.error.issues[0]?.message ?? 'auth.validation.email'),
      )
      return
    }

    setEmailError('')
    setLinkSent(false)
    setIsSendingLink(true)

    try {
      await partnerService.requestMagicLink(parsed.data.email)
      setLinkSent(true)
    } catch (requestError) {
      setEmailError(getApiErrorMessage(requestError, t))
    } finally {
      setIsSendingLink(false)
    }
  }

  const handleOpenToken = () => {
    const trimmed = token.trim()

    if (!trimmed) {
      return
    }

    router.push({ params: { token: trimmed }, pathname: '/verify' })
  }

  return (
    <Screen style={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t('auth.welcome', { appName: env.appDisplayName })}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('auth.requiredLogin')}
        </Text>
      </View>

      <Card>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label={t('auth.email')}
          onChangeText={setEmail}
          textContentType="emailAddress"
          value={email}
        />
        {emailError ? (
          <Text style={[styles.message, { color: theme.danger }]}>
            {emailError}
          </Text>
        ) : null}
        {linkSent ? (
          <Text style={[styles.message, { color: theme.success }]}>
            {t('auth.linkSent')}
          </Text>
        ) : null}
        <Button
          loading={isSendingLink}
          onPress={() => void handleRequestLink()}
        >
          {t('auth.sendLink')}
        </Button>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('auth.haveTokenTitle')}
        </Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {t('auth.haveTokenSubtitle')}
        </Text>
        <Input
          autoCapitalize="none"
          autoCorrect={false}
          label={t('auth.tokenLabel')}
          onChangeText={setToken}
          value={token}
        />
        <Button onPress={handleOpenToken} variant="secondary">
          {t('auth.verifyAction')}
        </Button>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  header: {
    gap: Spacing.one,
  },
  message: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
})
