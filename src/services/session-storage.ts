import * as SecureStore from 'expo-secure-store'

const SESSION_TOKEN_KEY = 'megapartner.sessionToken'
const SESSION_EXPIRES_AT_KEY = 'megapartner.sessionExpiresAt'

export const getStoredSessionToken = async (): Promise<string | null> => {
  const [token, expiresAtRaw] = await Promise.all([
    SecureStore.getItemAsync(SESSION_TOKEN_KEY),
    SecureStore.getItemAsync(SESSION_EXPIRES_AT_KEY),
  ])

  if (!token) {
    return null
  }

  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : NaN
  if (Number.isFinite(expiresAt) && Date.now() >= expiresAt) {
    await clearStoredSessionToken()
    return null
  }

  return token
}

export const saveStoredSessionToken = async (
  token: string,
  expiresInSeconds?: number,
): Promise<void> => {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token)
  if (typeof expiresInSeconds === 'number' && expiresInSeconds > 0) {
    const expiresAt = Date.now() + expiresInSeconds * 1000
    await SecureStore.setItemAsync(SESSION_EXPIRES_AT_KEY, String(expiresAt))
  } else {
    await SecureStore.deleteItemAsync(SESSION_EXPIRES_AT_KEY)
  }
}

export const clearStoredSessionToken = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(SESSION_TOKEN_KEY),
    SecureStore.deleteItemAsync(SESSION_EXPIRES_AT_KEY),
  ])
}
