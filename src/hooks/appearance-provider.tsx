import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AppearanceContext,
  type AppearanceContextValue,
} from '@/hooks/appearance-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { appearanceStorage } from '@/services/appearance-storage'
import {
  resolveEffectiveColorScheme,
  type AppearancePreference,
} from '@/theme/color-scheme'

type AppearanceProviderProps = {
  children: ReactNode
}

export const AppearanceProvider = ({ children }: AppearanceProviderProps) => {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] =
    useState<AppearancePreference>('system')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let active = true

    void appearanceStorage.resolveInitial().then((stored) => {
      if (!active) {
        return
      }
      setPreferenceState(stored)
      setIsReady(true)
    })

    return () => {
      active = false
    }
  }, [])

  const setPreference = useCallback(async (next: AppearancePreference) => {
    setPreferenceState(next)
    await appearanceStorage.save(next)
  }, [])

  const scheme = useMemo(
    () => resolveEffectiveColorScheme(preference, systemScheme),
    [preference, systemScheme],
  )

  const value = useMemo<AppearanceContextValue>(
    () => ({
      isReady,
      preference,
      scheme,
      setPreference,
    }),
    [isReady, preference, scheme, setPreference],
  )

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  )
}

export const useAppearance = () => {
  const context = useContext(AppearanceContext)

  if (!context) {
    throw new Error('useAppearance deve ser usado dentro de AppearanceProvider')
  }

  return context
}
