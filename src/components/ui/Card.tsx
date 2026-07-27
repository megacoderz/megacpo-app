import { ReactNode } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { BorderRadius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type CardProps = {
  children: ReactNode
  style?: ViewStyle
}

export const Card = ({ children, style }: CardProps) => {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
})
