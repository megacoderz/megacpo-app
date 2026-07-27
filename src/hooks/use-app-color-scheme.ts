import { useContext } from 'react'

import { AppearanceContext } from '@/hooks/appearance-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import {
  resolveEffectiveColorScheme,
  type ColorScheme,
} from '@/theme/color-scheme'

export const useAppColorScheme = (): ColorScheme => {
  const context = useContext(AppearanceContext)
  const systemScheme = useColorScheme()

  if (context) {
    return context.scheme
  }

  return resolveEffectiveColorScheme('system', systemScheme)
}
