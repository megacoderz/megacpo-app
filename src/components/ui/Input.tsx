import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'

import { BorderRadius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type InputProps = TextInputProps & {
  error?: string
  label: string
}

export const Input = ({ error, label, style, ...props }: InputProps) => {
  const theme = useTheme()

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.danger : theme.border,
            color: theme.text,
          },
          style,
        ]}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  error: {
    fontSize: 12,
  },
  input: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  wrapper: {
    gap: Spacing.one,
  },
})
