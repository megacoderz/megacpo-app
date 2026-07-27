import { Platform } from 'react-native'

import { env } from '@/config/env'

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`

const mixHex = (
  hex: string,
  target: [number, number, number],
  ratio: number,
): string => {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    r + (target[0] - r) * ratio,
    g + (target[1] - g) * ratio,
    b + (target[2] - b) * ratio,
  )
}

export const buildPalette = (primary: string) => ({
  primary,
  primaryDark: mixHex(primary, [0, 0, 0], 0.22),
  primarySoft: mixHex(primary, [255, 255, 255], 0.88),
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  white: '#ffffff',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate700: '#334155',
  slate900: '#0f172a',
  slate950: '#020617',
})

const palette = buildPalette(env.primaryColor)

export const Colors = {
  light: {
    text: palette.slate900,
    background: palette.slate50,
    backgroundElement: palette.white,
    backgroundSelected: palette.primarySoft,
    border: palette.slate200,
    card: palette.white,
    muted: palette.slate100,
    primary: palette.primary,
    primaryContrast: palette.white,
    textSecondary: palette.slate500,
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
  },
  dark: {
    text: palette.slate50,
    background: palette.slate950,
    backgroundElement: '#111827',
    backgroundSelected: mixHex(palette.primary, [0, 0, 0], 0.55),
    border: '#1f2937',
    card: '#0b1120',
    muted: '#111827',
    primary: mixHex(palette.primary, [255, 255, 255], 0.35),
    primaryContrast: palette.slate950,
    textSecondary: palette.slate400,
    success: '#22c55e',
    warning: '#fbbf24',
    danger: '#f87171',
  },
} as const

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})

export const Spacing = {
  half: 4,
  one: 8,
  two: 16,
  three: 24,
  four: 32,
  five: 40,
  six: 48,
} as const

export const MaxContentWidth = 720

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const
