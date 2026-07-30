#!/usr/bin/env node
/**
 * Valida variáveis obrigatórias antes de EAS Build (production/preview).
 * Uso: node scripts/validate-eas-env.js [profile]
 */

const profile = process.argv[2] ?? process.env.EAS_BUILD_PROFILE ?? 'production'

const isProductionLike =
  profile === 'production' || profile.startsWith('production-')

const requiredForStore = ['EXPO_PUBLIC_API_URL']

const recommendedForProduction = ['EXPO_PUBLIC_SENTRY_DSN']

const missing = requiredForStore.filter((key) => !process.env[key]?.trim())
const warnings = isProductionLike
  ? recommendedForProduction.filter((key) => !process.env[key]?.trim())
  : []

if (missing.length > 0) {
  console.error(`\n❌ Perfil "${profile}": variáveis obrigatórias ausentes:\n`)
  for (const key of missing) {
    console.error(`  - ${key}`)
  }
  console.error(
    '\nConfigure em https://expo.dev → projeto megapartner → Environment variables\n' +
      'Ou exporte localmente antes do build (não commitar secrets).\n' +
      'Ver megapartner/EAS_PUBLISH.md\n',
  )
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  Perfil "${profile}": recomendado configurar:\n`)
  for (const key of warnings) {
    console.warn(`  - ${key}`)
  }
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? ''
if (/localhost|127\.0\.0\.1/i.test(apiUrl)) {
  console.error(
    `\n❌ EXPO_PUBLIC_API_URL aponta para localhost (${apiUrl}). Use URL pública HTTPS para lojas.\n`,
  )
  process.exit(1)
}

console.log(`✅ Perfil "${profile}": variáveis EAS OK para build.`)
