import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ApiClientError,
  apiRequest,
  setUnauthorizedHandler,
  unwrapData,
} from '@/services/api-client'
import * as sessionStorage from '@/services/session-storage'

const jsonResponse = (
  body: unknown,
  init: { status?: number } = {},
): Response =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: init.status ?? 200,
  })

describe('unwrapData', () => {
  it('unwraps the { data } envelope', () => {
    expect(unwrapData({ data: { id: '1' } })).toEqual({ id: '1' })
  })

  it('returns the raw payload when there is no data envelope', () => {
    expect(unwrapData({ id: '1' })).toEqual({ id: '1' })
  })
})

describe('apiRequest', () => {
  beforeEach(() => {
    vi.spyOn(sessionStorage, 'getStoredSessionToken').mockResolvedValue(
      'partner-session-token',
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    setUnauthorizedHandler(null)
  })

  it('unwraps a successful { data } response and sends the partner session header', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: { email: 'a@a.com' } }))

    const result = await apiRequest<{ email: string }>('/v1/partner/me')

    expect(result).toEqual({ email: 'a@a.com' })
    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = requestInit.headers as Headers
    expect(headers.get('x-partner-token')).toBe('partner-session-token')
  })

  it('returns undefined for 204 No Content responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    )

    const result = await apiRequest<void>('/v1/partner/auth/magic-link', {
      body: { email: 'a@a.com' },
      method: 'POST',
      skipAuth: true,
    })

    expect(result).toBeUndefined()
  })

  it('throws ApiClientError with the API error code/message on failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'PARTNER_SESSION_INVALID',
            message: 'Invalid session',
          },
        },
        { status: 401 },
      ),
    )

    await expect(apiRequest('/v1/partner/me')).rejects.toMatchObject({
      code: 'PARTNER_SESSION_INVALID',
      message: 'Invalid session',
      status: 401,
    })
  })

  it('calls the unauthorized handler on a 401 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(
        { error: { code: 'PARTNER_SESSION_INVALID' } },
        { status: 401 },
      ),
    )
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    await expect(apiRequest('/v1/partner/me')).rejects.toBeInstanceOf(
      ApiClientError,
    )
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('wraps network failures as a NETWORK_ERROR ApiClientError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('Network request failed'),
    )

    await expect(apiRequest('/v1/partner/me')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    })
  })

  it('appends defined search params to the request URL', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: [] }))

    await apiRequest('/v1/partner/earnings', {
      searchParams: { fromMonth: '2026-01', toMonth: undefined },
    })

    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toContain('fromMonth=2026-01')
    expect(url).not.toContain('toMonth')
  })
})
