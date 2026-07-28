import * as Sentry from '@sentry/react-native'

import { env } from '@/config/env'

const SENSITIVE_KEYS = [
  'password',
  'cpf',
  'authorization',
  'token',
  'card',
  'cvv',
]

const scrubObject = (
  input: Record<string, unknown>,
): Record<string, unknown> => {
  const output: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      output[key] = '[REDACTED]'
      continue
    }

    output[key] = value
  }

  return output
}

export const initSentry = (): void => {
  if (!env.sentryEnabled || !env.sentryDsn) {
    return
  }

  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.sentryEnvironment,
    enabled: true,
    beforeSend(event) {
      if (event.extra) {
        event.extra = scrubObject(event.extra as Record<string, unknown>)
      }

      return event
    },
  })
}

export const captureException = (error: unknown): void => {
  if (!env.sentryEnabled) {
    return
  }

  Sentry.captureException(error)
}
