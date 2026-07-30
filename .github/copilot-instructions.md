# Mega Partner — Copilot instructions

## Product

- Expo app for station partners / investors (payouts, Connect status)
- Magic-link auth with `x-partner-token` — not the driver app or Mega Support

## Stack

- Expo SDK first (`bunx expo install`); Bun PM; session in Secure Store
- i18next pt-BR / en-US / es-ES; Zod before API calls
- Appearance preference local (system/light/dark)

## Quality

- `bun run verify` = lint + typecheck + test:cov
- TypeScript major 7+ must not be introduced (Expo/EAS)
- FlatList for statement lists; HTTP only via services

## Review focus

- Partner session header correctness; no staff/driver auth mix-up
- Minimize PII (partner email only where needed)
- Stripe Connect status UI must not invent payout mutations beyond existing APIs
