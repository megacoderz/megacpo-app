import type { TFunction } from 'i18next'

import { ApiClientError } from '@/services/api-client'
import { isNetworkError } from '@/utils/is-network-error'

const API_ERROR_KEYS: Record<string, string> = {
  NETWORK_ERROR: 'common.apiCommunicationError',
  PARTNER_SESSION_INVALID: 'auth.sessionExpired',
  PARTNER_MAGIC_LINK_INVALID: 'auth.tokenInvalid',
  PARTNER_MAGIC_LINK_EXPIRED: 'auth.tokenExpired',
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
