import { apiRequest, ApiClientError } from '@/services/api-client'
import i18n from '@/i18n'
import { env } from '@/config/env'
import { getStoredSessionToken } from '@/services/session-storage'

export type PartnerKind = 'station_owner' | 'investor'
export type PartnerStatus = 'pending' | 'active' | 'suspended'
export type PartnerStripeStatus =
  'missing' | 'pending' | 'connected' | 'disconnected' | 'error'

export type PartnerMe = {
  id: string
  tenantId: string
  email: string
  kind: PartnerKind
  status: PartnerStatus
  stripeStatus: PartnerStripeStatus
}

export type VerifyPartnerMagicLinkResponse = {
  sessionToken: string
  expiresIn: number
  sitePartnerId: string
  tenantId: string
}

export type PartnerConnectStatus = {
  sitePartnerId: string
  status: PartnerStripeStatus
  connectionType: 'oauth' | 'manual'
  stripeAccountId?: string | null
  connectedAt?: string | null
  lastError?: string | null
}

export type PartnerConnectOnboarding = {
  authorizationUrl: string
}

export type PartnerInvoiceSplit = {
  id: string
  invoiceId: string
  sitePartnerId: string
  kind: PartnerKind
  splitPercent: number
  shareCents: number
  status: 'pending' | 'transferred' | 'failed' | 'skipped'
  stripeTransferId?: string | null
  createdAt: string
}

export type PartnerEarnings = {
  items: PartnerInvoiceSplit[]
  totalTransferredCents: number
  totalPendingCents: number
}

export type ListPartnerEarningsParams = {
  fromMonth?: string
  toMonth?: string
}

export type StartConnectOnboardingInput = {
  refreshUrl?: string
  returnUrl?: string
}

const PARTNER_TOKEN_HEADER = 'x-partner-token'

export const partnerService = {
  requestMagicLink: (email: string): Promise<void> =>
    apiRequest<void>('/v1/partner/auth/magic-link', {
      body: { email },
      method: 'POST',
      skipAuth: true,
    }),

  verifyMagicLink: (token: string): Promise<VerifyPartnerMagicLinkResponse> =>
    apiRequest<VerifyPartnerMagicLinkResponse>('/v1/partner/auth/verify', {
      body: { token },
      method: 'POST',
      skipAuth: true,
    }),

  getMe: (): Promise<PartnerMe> => apiRequest<PartnerMe>('/v1/partner/me'),

  getEarnings: (params?: ListPartnerEarningsParams): Promise<PartnerEarnings> =>
    apiRequest<PartnerEarnings>('/v1/partner/earnings', {
      searchParams: params,
    }),

  exportEarningsCsv: async (month: string): Promise<string> => {
    const baseUrl = env.apiUrl.replace(/\/$/, '')
    const url = new URL(`${baseUrl}/v1/partner/earnings/export.csv`)
    url.searchParams.set('month', month)

    const headers = new Headers({
      Accept: 'text/csv',
      'Accept-Language': i18n.language || 'pt-BR',
    })
    const token = await getStoredSessionToken()
    if (token) {
      headers.set(PARTNER_TOKEN_HEADER, token)
    }

    const response = await fetch(url.toString(), {
      headers,
      method: 'GET',
    })

    if (!response.ok) {
      throw new ApiClientError(
        i18n.t('common.apiCommunicationError'),
        response.status,
      )
    }

    return response.text()
  },

  getConnectStatus: (): Promise<PartnerConnectStatus> =>
    apiRequest<PartnerConnectStatus>('/v1/partner/connect/status'),

  startConnectOnboarding: (
    input: StartConnectOnboardingInput,
  ): Promise<PartnerConnectOnboarding> =>
    apiRequest<PartnerConnectOnboarding>('/v1/partner/connect/onboarding', {
      body: input,
      method: 'POST',
    }),
}
