import { ReactNode } from 'react'
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { MaxContentWidth, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type ScreenProps = {
  children: ReactNode
  refreshControl?: ScrollViewProps['refreshControl']
  scroll?: boolean
  style?: ViewStyle
}

export const Screen = ({
  children,
  refreshControl,
  scroll = true,
  style,
}: ScreenProps) => {
  const theme = useTheme()
  const contentStyle = [styles.content, style]

  if (!scroll) {
    return (
      <SafeAreaView
        edges={['left', 'right', 'top']}
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View style={contentStyle}>{children}</View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'top']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={contentStyle}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
})
