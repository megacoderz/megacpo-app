// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '**/*.spec.ts', '**/*.test.ts', 'vitest.setup.ts'],
  },
  {
    files: ['src/i18n/index.ts'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
])
