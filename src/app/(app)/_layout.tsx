import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="appearance"
        options={{
          headerShown: true,
          presentation: 'card',
        }}
      />
      <Stack.Screen name="help/index" />
      <Stack.Screen name="help/[slug]" />
    </Stack>
  )
}
