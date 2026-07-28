import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{spec,test}.ts'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/services/**/*.ts',
        'src/schemas/**/*.ts',
        'src/utils/**/*.ts',
        'src/theme/color-scheme.ts',
        'src/i18n/locale-utils.ts',
      ],
      exclude: [
        '**/*.{spec,test}.ts',
        '**/node_modules/**',
        '**/avatar-image.service.ts',
      ],
      thresholds: {
        statements: 70,
        branches: 50,
        functions: 60,
        lines: 70,
      },
    },
  },
})
