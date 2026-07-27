import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as SecureStore from 'expo-secure-store'

import {
  clearStoredSessionToken,
  getStoredSessionToken,
  saveStoredSessionToken,
} from '@/services/session-storage'

describe('session-storage', () => {
  beforeEach(() => {
    vi.mocked(SecureStore.getItemAsync).mockReset()
    vi.mocked(SecureStore.setItemAsync).mockReset()
    vi.mocked(SecureStore.deleteItemAsync).mockReset()
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null)
    vi.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined)
    vi.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined)
  })

  it('persists token with expiresAt when expiresIn is provided', async () => {
    await saveStoredSessionToken('tok', 3600)

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'megapartner.sessionToken',
      'tok',
    )
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'megapartner.sessionExpiresAt',
      expect.any(String),
    )
  })

  it('clears expired token on read', async () => {
    vi.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => {
      if (key === 'megapartner.sessionToken') return 'tok'
      if (key === 'megapartner.sessionExpiresAt')
        return String(Date.now() - 1000)
      return null
    })

    await expect(getStoredSessionToken()).resolves.toBeNull()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled()
  })

  it('returns token when not expired', async () => {
    vi.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => {
      if (key === 'megapartner.sessionToken') return 'tok'
      if (key === 'megapartner.sessionExpiresAt')
        return String(Date.now() + 60_000)
      return null
    })

    await expect(getStoredSessionToken()).resolves.toBe('tok')
  })

  it('clearStoredSessionToken removes both keys', async () => {
    await clearStoredSessionToken()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'megapartner.sessionToken',
    )
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'megapartner.sessionExpiresAt',
    )
  })
})
