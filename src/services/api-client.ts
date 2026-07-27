import i18n from '@/i18n'
import { env } from '@/config/env'
import { getStoredSessionToken } from '@/services/session-storage'
import { isNetworkError } from '@/utils/is-network-error'

const PARTNER_TOKEN_HEADER = 'x-partner-token'

type ApiErrorPayload = {
  error?: {
    code?: string
    details?: unknown
    message?: string
  }
  message?: string
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>
  skipAuth?: boolean
  searchParams?: Record<string, string | number | boolean | undefined | null>
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message)
  }
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler
}

const baseUrl = env.apiUrl.replace(/\/$/, '')

export const unwrapData = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }

  return payload as T
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

const buildHeaders = async (options: ApiRequestOptions) => {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('Accept-Language', i18n.language || 'pt-BR')

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (!options.skipAuth) {
    const token = await getStoredSessionToken()

    if (token) {
      headers.set(PARTNER_TOKEN_HEADER, token)
    }
  }

  return headers
}

const appendSearchParams = (
  url: URL,
  searchParams?: ApiRequestOptions['searchParams'],
) => {
  if (!searchParams) {
    return
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined || value === null || value === '') {
      continue
    }
    url.searchParams.set(key, String(value))
  }
}

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const url = path.startsWith('http')
    ? new URL(path)
    : new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`)
  appendSearchParams(url, options.searchParams)

  const headers = await buildHeaders(options)

  try {
    const response = await fetch(url.toString(), {
      ...options,
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
      headers,
    })

    const payload = await parseResponse<unknown>(response)

    if (!response.ok) {
      if (response.status === 401 && !options.skipAuth) {
        unauthorizedHandler?.()
      }

      const errorPayload = payload as ApiErrorPayload
      throw new ApiClientError(
        errorPayload?.error?.message ??
          errorPayload?.message ??
          i18n.t('common.apiCommunicationError'),
        response.status,
        errorPayload?.error?.code,
        errorPayload?.error?.details,
      )
    }

    return unwrapData<T>(payload)
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    if (isNetworkError(error)) {
      throw new ApiClientError(
        i18n.t('common.apiCommunicationError'),
        0,
        'NETWORK_ERROR',
      )
    }

    throw error
  }
}

export const apiUrl = baseUrl
