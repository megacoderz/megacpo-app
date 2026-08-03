# Mega Partner

App Expo para **sócios e investidores** de eletropostos (extrato de repasses, Stripe Connect e preferências).

Não é o app do motorista (`megavoltz/`) nem o Mega Support (`megasupport/`).

> Pasta local / remote: `megapartner/` · npm name / Expo slug / scheme: `megapartner` · bundle: `br.com.megacoderz.megapartner.app`

Documentação canônica: [**megavoltz-docs**](https://github.com/megacoderz/megavoltz-docs) · Split N-way: [`site-partner-splits.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/site-partner-splits.md)

## Escopo

| Dentro                                         | Fora                           |
| ---------------------------------------------- | ------------------------------ |
| Auth magic-link (`x-partner-token`)            | Recarga, wallet, mapa, OCPP    |
| Extrato de repasses (`invoice_partner_splits`) | Operação de postos / staff CPO |
| Status Stripe Connect + reenvio Account Link   | Inbox de suporte L1            |
| Preferências: idioma + aparência               | —                              |

## Pré-requisitos

- **Bun** 1.3+ (`packageManager` no `package.json`)
- **Node.js** >= 24
- API Mega Voltz em `EXPO_PUBLIC_API_URL`

## Setup

```bash
make env-init   # copia env.example.dist → .env se ausente
bun install
```

Variáveis principais em `env.example.dist`:

- `EXPO_PUBLIC_API_URL` — base da API **sem** `/v1` (ex.: `http://localhost:3001`)
- `EXPO_PUBLIC_APP_DISPLAY_NAME=Mega Partner`
- `EXPO_PUBLIC_PRIMARY_COLOR="#0284c7"`

Em **device físico**, use o IP LAN da máquina (não `localhost`).

Device iOS com **Personal Team** (Apple ID gratuito): descomente no `.env` o bloco `EXPO_IOS_PERSONAL_TEAM` em `env.example.dist` (`EXPO_IOS_BUNDLE_IDENTIFIER=br.com.megacoderz.megapartner.app`), depois `bun run prebuild:clean && bun run ios -- --device`.

## Desenvolvimento

```bash
bun run start
# ou
make start
```

## Quality gates

```bash
bun run format
bun run verify          # lint → typecheck → test:cov
bun run i18n:check
make verify             # equivalente via Makefile
```

Antes de preview/produção:

```bash
bun run verify:release  # verify + i18n + expo-doctor
```

## Estrutura

```
src/app/(auth)/login|verify|entrar
src/app/(app)/(tabs)/index|earnings|profile
src/app/(app)/appearance
src/services/          # api-client, partner, session/locale/appearance storage
src/locales/           # pt-BR, en-US, es-ES
src/schemas/           # Zod (auth magic-link)
```

## Deep links

- Scheme: `megapartner://`
- Universal / App Links: `https://partner.megavoltz.com.br/entrar` (HMG: `hmg-partner.…`) → rota `(auth)/entrar` (= verify)
- Connect return URLs usam o mesmo scheme; allowlist API aceita `megapartner:` (+ legado `megapartner:` na janela de migração — ver `EAS_PUBLISH.md`)

## Auth e API

- Sessão via **magic-link** → `sessionToken` em **expo-secure-store**
- Header `x-partner-token` nas rotas `/v1/partner/*`
- Chamadas diretas a `{EXPO_PUBLIC_API_URL}/v1/...` (sem BFF web)
- Enviar `Accept-Language` alinhado ao locale da UI (`pt-BR` / `en-US` / `es-ES`)

## EAS

Ver [`EAS_PUBLISH.md`](EAS_PUBLISH.md) e `eas.json` (profiles `preview` / `production`).

```bash
bun run validate:eas:preview   # ou validate:eas (production)
bun run build:preview
bun run build:production
```
