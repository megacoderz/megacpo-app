import { vi } from 'vitest'

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3001',
        primaryColor: '#0284c7',
        appDisplayName: 'Mega Partner',
      },
    },
  },
}))

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => undefined),
  deleteItemAsync: vi.fn(async () => undefined),
}))

vi.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'pt-BR' }],
}))

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>()
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: async (key: string) => {
        store.delete(key)
      },
    },
  }
})
