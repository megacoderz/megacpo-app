import { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native'

import { BorderRadius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = {
  children: ReactNode
  disabled?: boolean
  loading?: boolean
  onPress: () => void
  style?: ViewStyle
  variant?: ButtonVariant
}

export const Button = ({
  children,
  disabled = false,
  loading = false,
  onPress,
  style,
  variant = 'primary',
}: ButtonProps) => {
  const theme = useTheme()
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor:
            variant === 'primary'
              ? theme.primary
              : variant === 'danger'
                ? theme.danger
                : variant === 'secondary'
                  ? theme.backgroundSelected
                  : 'transparent',
          borderColor: variant === 'ghost' ? 'transparent' : theme.border,
          opacity: pressed || isDisabled ? 0.72 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? theme.primaryContrast : theme.primary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color:
                variant === 'primary' || variant === 'danger'
                  ? theme.primaryContrast
                  : theme.text,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
})
