import { Image } from 'expo-image'
import { StyleSheet, Text, View } from 'react-native'

import { BorderRadius } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ProfileAvatarProps = {
  avatarUrl?: string | null
  initials: string
  size?: 'md' | 'lg'
}

export const ProfileAvatar = ({
  avatarUrl,
  initials,
  size = 'lg',
}: ProfileAvatarProps) => {
  const theme = useTheme()
  const dimension = size === 'lg' ? 64 : 48

  return (
    <View
      accessibilityLabel={initials}
      style={[
        styles.avatar,
        {
          backgroundColor: theme.muted,
          borderColor: theme.border,
          height: dimension,
          width: dimension,
        },
      ]}
    >
      {avatarUrl ? (
        <Image
          accessibilityIgnoresInvertColors
          contentFit="cover"
          source={{ uri: avatarUrl }}
          style={styles.image}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            { color: theme.text, fontSize: size === 'lg' ? 22 : 18 },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  initials: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
})
