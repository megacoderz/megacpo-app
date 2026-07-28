import type { TFunction } from 'i18next'

import { ApiClientError } from '@/services/api-client'
import { isNetworkError } from '@/utils/is-network-error'

const API_ERROR_KEYS: Record<string, string> = {
  NETWORK_ERROR: 'common.apiCommunicationError',
  PARTNER_SESSION_INVALID: 'auth.sessionExpired',
  PARTNER_MAGIC_LINK_INVALID: 'auth.tokenInvalid',
  PARTNER_MAGIC_LINK_EXPIRED: 'auth.tokenExpired',
  AVATAR_FACE_NOT_FOUND: 'profile.avatar.faceNotFound',
  AVATAR_FILE_REQUIRED: 'profile.avatar.fileRequired',
  AVATAR_INVALID_TYPE: 'profile.avatar.invalidType',
  AVATAR_TOO_LARGE: 'profile.avatar.tooLarge',
}

export const getApiErrorMessage = (
  error: unknown,
  t: TFunction,
  fallbackKey = 'common.error',
): string => {
  if (error instanceof ApiClientError) {
    if (error.code) {
      const key = API_ERROR_KEYS[error.code]
      if (key) {
        return t(key)
      }
    }

    if (error.message?.trim()) {
      return error.message
    }
  }

  if (isNetworkError(error)) {
    return t('common.apiCommunicationError')
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return t(fallbackKey)
}
