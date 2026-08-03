import { Image } from 'expo-image'
import { router, type Href } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AvatarPicker } from '@/components/profile/AvatarPicker'
import { Button, Card, Input, Screen } from '@/components/ui'
import { Spacing } from '@/constants/theme'
import { usePartnerAuth } from '@/hooks/use-partner-auth'
import { useTheme } from '@/hooks/use-theme'
import {
  changeAppLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n'
import { pickAndCropAvatar } from '@/services/avatar-image.service'
import { partnerService } from '@/services/partner.service'
import { getApiErrorMessage } from '@/utils/api-error-message'
import { getNameInitials } from '@/utils/name-initials'

export default function ProfileScreen() {
  const { i18n, t } = useTranslation()
  const theme = useTheme()
  const { logout, partner, refreshMe } = usePartnerAuth()
  const [name, setName] = useState(partner?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(partner?.avatarUrl ?? null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const resolvedAvatarUrl = avatarUrl ?? partner?.avatarUrl ?? null
  const resolvedName = name || partner?.name || ''

  const handleLogout = () => {
    void logout().then(() => router.replace('/login'))
  }

  const handleSaveName = async () => {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError(t('profile.validation.name'))
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await partnerService.updateMe({ name: trimmed })
      await refreshMe()
      setSuccess(t('profile.profileUpdated'))
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, t))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePick = async () => {
    setError('')
    const file = await pickAndCropAvatar()
    if (!file) {
      return
    }

    setIsUploading(true)
    try {
      const result = await partnerService.uploadAvatar(file)
      await Image.clearMemoryCache()
      await Image.clearDiskCache()
      setAvatarUrl(result.avatarUrl)
      await refreshMe()
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, t, 'profile.avatar.uploadError'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    Alert.alert(
      t('profile.avatar.removeConfirmTitle'),
      t('profile.avatar.removeConfirmMessage'),
      [
        { style: 'cancel', text: t('common.cancel') },
        {
          style: 'destructive',
          text: t('profile.avatar.remove'),
          onPress: () => {
            void (async () => {
              setError('')
              setIsRemoving(true)
              try {
                await partnerService.deleteAvatar()
                await Image.clearMemoryCache()
                await Image.clearDiskCache()
                setAvatarUrl(null)
                await refreshMe()
              } catch (deleteError) {
                setError(
                  getApiErrorMessage(
                    deleteError,
                    t,
                    'profile.avatar.removeError',
                  ),
                )
              } finally {
                setIsRemoving(false)
              }
            })()
          },
        },
      ],
    )
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.text }]}>
        {t('profile.title')}
      </Text>

      <Card>
        <AvatarPicker
          avatarUrl={resolvedAvatarUrl}
          changeLabel={t('profile.avatar.change')}
          initials={getNameInitials(resolvedName || partner?.email)}
          isRemoving={isRemoving}
          isUploading={isUploading}
          onPick={() => void handlePick()}
          onRemove={handleRemove}
          removeLabel={t('profile.avatar.remove')}
        />

        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('profile.email')}
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {partner?.email ?? '-'}
          </Text>
        </View>

        <Input label={t('profile.name')} onChangeText={setName} value={name} />
        {error ? <Text style={{ color: theme.danger }}>{error}</Text> : null}
        {success ? (
          <Text style={{ color: theme.success }}>{success}</Text>
        ) : null}
        <Button loading={isSubmitting} onPress={() => void handleSaveName()}>
          {t('common.save')}
        </Button>
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

      <Card>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/help' as Href)}
          style={styles.menuRow}
        >
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('help.hubTitle')}
            </Text>
            <Text style={{ color: theme.textSecondary }}>
              {t('help.hubSubtitle')}
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
