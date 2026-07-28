import Ionicons from '@expo/vector-icons/Ionicons'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { BorderRadius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type AvatarPickerProps = {
  avatarUrl?: string | null
  changeLabel: string
  initials: string
  isRemoving?: boolean
  isUploading?: boolean
  onPick: () => void
  onRemove?: () => void
  removeLabel?: string
}

export const AvatarPicker = ({
  avatarUrl,
  changeLabel,
  initials,
  isRemoving = false,
  isUploading = false,
  onPick,
  onRemove,
  removeLabel,
}: AvatarPickerProps) => {
  const theme = useTheme()
  const isBusy = isUploading || isRemoving

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={changeLabel}
        accessibilityRole="button"
        disabled={isBusy}
        onPress={onPick}
        style={styles.avatarButton}
      >
        <ProfileAvatar avatarUrl={avatarUrl} initials={initials} size="lg" />
        {isUploading ? (
          <View style={[styles.overlay, { backgroundColor: theme.background }]}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <View
            style={[
              styles.editBadge,
              { backgroundColor: theme.primary, borderColor: theme.card },
            ]}
          >
            <Ionicons color={theme.primaryContrast} name="camera" size={14} />
          </View>
        )}
      </Pressable>

      {avatarUrl && onRemove ? (
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={onRemove}
        >
          <Text
            style={[
              styles.removeLabel,
              { color: theme.danger, opacity: isBusy ? 0.6 : 1 },
            ]}
          >
            {removeLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  avatarButton: {
    alignSelf: 'center',
  },
  editBadge: {
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    bottom: -2,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 26,
  },
  overlay: {
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    opacity: 0.85,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  removeLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  wrapper: {
    alignItems: 'center',
    gap: Spacing.one,
  },
})
