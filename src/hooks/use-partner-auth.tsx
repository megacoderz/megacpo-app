import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { router, useRootNavigationState, useSegments } from 'expo-router'

import { setUnauthorizedHandler } from '@/services/api-client'
import { partnerService, type PartnerMe } from '@/services/partner.service'
import {
  clearStoredSessionToken,
  getStoredSessionToken,
  saveStoredSessionToken,
} from '@/services/session-storage'

type PartnerAuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  partner?: PartnerMe
  refreshMe: () => Promise<void>
  verify: (token: string) => Promise<void>
}

const PartnerAuthContext = createContext<PartnerAuthContextValue | undefined>(
  undefined,
)

type PartnerAuthProviderProps = {
  children: ReactNode
}

export const PartnerAuthProvider = ({ children }: PartnerAuthProviderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [partner, setPartner] = useState<PartnerMe | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const resetAuthState = useCallback(async () => {
    await clearStoredSessionToken()
    setPartner(undefined)
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    let active = true

    void (async () => {
      const token = await getStoredSessionToken()

      if (!active) {
        return
      }

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const me = await partnerService.getMe()
        if (!active) {
          return
        }
        setPartner(me)
        setIsAuthenticated(true)
      } catch {
        if (!active) {
          return
        }
        await resetAuthState()
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [resetAuthState])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void resetAuthState()
    })

    return () => setUnauthorizedHandler(null)
  }, [resetAuthState])

  const verify = async (token: string) => {
    const response = await partnerService.verifyMagicLink(token)
    await saveStoredSessionToken(response.sessionToken, response.expiresIn)
    const me = await partnerService.getMe()
    setPartner(me)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    await resetAuthState()
  }

  const refreshMe = useCallback(async () => {
    const me = await partnerService.getMe()
    setPartner(me)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      logout,
      partner,
      refreshMe,
      verify,
    }),
    // login/logout are stable enough for gate consumers; refreshMe is memoized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, isLoading, partner, refreshMe],
  )

  return (
    <PartnerAuthContext.Provider value={value}>
      {children}
    </PartnerAuthContext.Provider>
  )
}

export const PartnerAuthGate = ({ children }: PartnerAuthProviderProps) => {
  const { isAuthenticated, isLoading } = usePartnerAuth()
  const segments = useSegments()
  const navigationState = useRootNavigationState()
  const isNavigationReady = Boolean(navigationState?.key)

  useEffect(() => {
    if (!isNavigationReady || isLoading) {
      return
    }

    const rootSegment = segments[0]
    const isAuthRoute = rootSegment === '(auth)'

    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/login')
      return
    }

    if (isAuthenticated && isAuthRoute) {
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, isNavigationReady, segments])

  if (isLoading || !isNavigationReady) {
    return null
  }

  return <>{children}</>
}

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext)

  if (!context) {
    throw new Error(
      'usePartnerAuth deve ser usado dentro de PartnerAuthProvider',
    )
  }

  return context
}
