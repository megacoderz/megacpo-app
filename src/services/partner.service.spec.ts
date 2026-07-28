import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api-client', () => ({
  apiRequest: vi.fn(async () => undefined),
  ApiClientError: class ApiClientError extends Error {
    constructor(
      message: string,
      public readonly status: number,
      public readonly code?: string,
    ) {
      super(message)
    }
  },
}))

vi.mock('@/services/session-storage', () => ({
  getStoredSessionToken: vi.fn(async () => 'session-token'),
}))

vi.mock('@/config/env', () => ({
  env: { apiUrl: 'https://api.test' },
}))

vi.mock('@/i18n', () => ({
  default: {
    language: 'pt-BR',
    t: (key: string) => key,
  },
}))

import { apiRequest } from '@/services/api-client'
import { partnerService } from '@/services/partner.service'

const apiRequestMock = vi.mocked(apiRequest)

describe('partnerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests a magic link without auth', async () => {
    await partnerService.requestMagicLink('partner@example.com')

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/auth/magic-link', {
      body: { email: 'partner@example.com' },
      method: 'POST',
      skipAuth: true,
    })
  })

  it('verifies a magic-link token without auth', async () => {
    await partnerService.verifyMagicLink('token-123')

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/auth/verify', {
      body: { token: 'token-123' },
      method: 'POST',
      skipAuth: true,
    })
  })

  it('fetches the current partner profile', async () => {
    await partnerService.getMe()

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/me')
  })

  it('fetches earnings with month range search params', async () => {
    await partnerService.getEarnings({
      fromMonth: '2026-01',
      toMonth: '2026-02',
    })

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/earnings', {
      searchParams: { fromMonth: '2026-01', toMonth: '2026-02' },
    })
  })

  it('exports earnings CSV for a month', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'mes_referencia;invoice_id\n2026-06;inv-1',
    })
    vi.stubGlobal('fetch', fetchMock)

    const csv = await partnerService.exportEarningsCsv('2026-06')

    expect(csv).toContain('inv-1')
    expect(fetchMock).toHaveBeenCalled()
  })

  it('fetches the Stripe Connect status', async () => {
    await partnerService.getConnectStatus()

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/connect/status')
  })

  it('starts Connect onboarding with refresh/return URLs', async () => {
    await partnerService.startConnectOnboarding({
      refreshUrl: 'https://app/refresh',
      returnUrl: 'https://app/return',
    })

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/v1/partner/connect/onboarding',
      {
        body: {
          refreshUrl: 'https://app/refresh',
          returnUrl: 'https://app/return',
        },
        method: 'POST',
      },
    )
  })

  it('updates partner display name', async () => {
    await partnerService.updateMe({ name: 'Sócio Teste' })

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/me', {
      body: { name: 'Sócio Teste' },
      method: 'PATCH',
    })
  })

  it('uploads avatar as multipart form data', async () => {
    await partnerService.uploadAvatar({
      name: 'avatar.jpg',
      type: 'image/jpeg',
      uri: 'file:///tmp/avatar.jpg',
    })

    expect(apiRequestMock).toHaveBeenCalledTimes(1)
    const [path, options] = apiRequestMock.mock.calls[0] ?? []
    expect(path).toBe('/v1/partner/me/avatar')
    expect(options?.method).toBe('POST')
    expect(options?.body).toBeInstanceOf(FormData)
  })

  it('deletes the current avatar', async () => {
    await partnerService.deleteAvatar()

    expect(apiRequestMock).toHaveBeenCalledWith('/v1/partner/me/avatar', {
      method: 'DELETE',
    })
  })
})
