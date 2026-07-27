#!/usr/bin/env node
/**
 * Auditoria i18n (i18next) — paridade pt-BR / en-US / es-ES
 * Uso: node scripts/check-i18n.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const LOCALES_DIR = path.join(ROOT, 'src', 'locales')
const SRC_DIR = path.join(ROOT, 'src')
const LOCALES = ['pt-BR', 'en-US', 'es-ES']

const DYNAMIC_PREFIX_WHITELIST = []

const flatten = (obj, prefix = '', out = new Map()) => {
  if (obj === null || obj === undefined) return out
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    if (prefix) out.set(prefix, obj)
    return out
  }
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, next, out)
      out.set(next, value)
    } else {
      out.set(next, value)
    }
  }
  return out
}

const leafKeys = (flat) => {
  const keys = new Set()
  for (const [k, v] of flat) {
    if (v !== null && typeof v === 'object') continue
    keys.add(k)
  }
  return keys
}

const walkFiles = (dir, exts, acc = []) => {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(full, exts, acc)
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      acc.push(full)
    }
  }
  return acc
}

const loadCatalogs = () => {
  const catalogs = {}
  for (const locale of LOCALES) {
    const file = path.join(LOCALES_DIR, `${locale}.json`)
    if (!fs.existsSync(file)) {
      console.error(`✖ Catálogo ausente: ${file}`)
      process.exit(1)
    }
    catalogs[locale] = JSON.parse(fs.readFileSync(file, 'utf8'))
  }
  return catalogs
}

const checkParity = (catalogs) => {
  const flats = Object.fromEntries(
    LOCALES.map((l) => [l, leafKeys(flatten(catalogs[l]))]),
  )
  const errors = []
  const base = flats['pt-BR']
  for (const locale of LOCALES) {
    if (locale === 'pt-BR') continue
    for (const key of base) {
      if (!flats[locale].has(key)) {
        errors.push(`[parity] ${key} em pt-BR falta em ${locale}`)
      }
    }
    for (const key of flats[locale]) {
      if (!base.has(key)) {
        errors.push(`[parity] ${key} em ${locale} falta em pt-BR`)
      }
    }
  }
  return { errors, flats }
}

const extractUsages = (content) => {
  const used = new Set()
  const dynamicPrefixes = new Set()

  const litRe = /(?:\bi18n\.t\b|\bt)\(\s*['"]([^'"]+)['"]/g
  let m
  while ((m = litRe.exec(content)) !== null) {
    used.add(m[1])
  }

  const keyRe = /i18nKey=\{?\s*['"]([^'"]+)['"]\s*\}?/g
  while ((m = keyRe.exec(content)) !== null) {
    used.add(m[1])
  }

  const dynRe = /(?:\bi18n\.t\b|\bt)\(\s*`([^`$]*)\$\{/g
  while ((m = dynRe.exec(content)) !== null) {
    if (m[1]) dynamicPrefixes.add(m[1])
  }

  const mapKeyRe = /['"]((?:[a-zA-Z][\w]*)(?:\.[a-zA-Z][\w-]*){1,})['"]/g
  while ((m = mapKeyRe.exec(content)) !== null) {
    used.add(m[1])
  }

  return { used, dynamicPrefixes }
}

const catalogHasPrefix = (allPaths, prefix) => {
  for (const key of allPaths) {
    if (key.startsWith(prefix)) return true
  }
  return false
}

const main = () => {
  const catalogs = loadCatalogs()
  const { errors: parityErrors, flats } = checkParity(catalogs)
  const fullFlat = flatten(catalogs['pt-BR'])
  const allPaths = new Set(fullFlat.keys())
  const allLeaves = flats['pt-BR']
  const topNamespaces = new Set(Object.keys(catalogs['pt-BR']))

  const files = walkFiles(SRC_DIR, ['.ts', '.tsx'])
  const usedKeys = new Set()
  const dynPrefixes = new Set()

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const { used, dynamicPrefixes } = extractUsages(content)
    for (const k of used) {
      const top = k.split('.')[0]
      if (topNamespaces.has(top)) usedKeys.add(k)
    }
    for (const p of dynamicPrefixes) dynPrefixes.add(p)
  }

  const missing = [...usedKeys].filter((k) => !allPaths.has(k)).sort()

  const dynErrors = []
  for (const prefix of dynPrefixes) {
    const whitelisted = DYNAMIC_PREFIX_WHITELIST.some(
      (w) => prefix.startsWith(w) || w.startsWith(prefix),
    )
    if (whitelisted || catalogHasPrefix(allPaths, prefix)) continue
    dynErrors.push(prefix)
  }

  const orphans = [...allLeaves].filter((k) => {
    if (usedKeys.has(k)) return false
    for (const p of dynPrefixes) {
      if (k.startsWith(p)) return false
    }
    return true
  })

  console.log('i18n check (megacpo / i18next)')
  console.log(`  locales: ${LOCALES.join(', ')}`)
  console.log(`  leaf keys (pt-BR): ${allLeaves.size}`)
  console.log(`  source files scanned: ${files.length}`)
  console.log(`  candidate keys used: ${usedKeys.size}`)
  console.log(`  dynamic prefixes: ${dynPrefixes.size}`)

  let failed = false

  if (parityErrors.length) {
    failed = true
    console.error(`\n✖ Paridade (${parityErrors.length}):`)
    for (const e of parityErrors.slice(0, 50)) console.error(`  - ${e}`)
  } else {
    console.log('\n✔ Paridade pt-BR / en-US / es-ES')
  }

  if (missing.length) {
    failed = true
    console.error(`\n✖ Chaves usadas sem catálogo (${missing.length}):`)
    for (const k of missing.slice(0, 80)) console.error(`  - ${k}`)
  } else {
    console.log('✔ Nenhuma chave referenciada faltando no catálogo')
  }

  if (dynErrors.length) {
    failed = true
    console.error(
      `\n✖ Prefixos dinâmicos sem cobertura no catálogo (${dynErrors.length}):`,
    )
    for (const p of dynErrors.slice(0, 50)) console.error(`  - ${p}`)
  } else {
    console.log('✔ Prefixos dinâmicos cobertos')
  }

  if (orphans.length) {
    console.log(
      `\nℹ Chaves órfãs (não referenciadas, informativo — ${orphans.length}):`,
    )
    for (const k of orphans.slice(0, 30)) console.log(`  - ${k}`)
  }

  if (failed) {
    process.exit(1)
  }
}

main()
