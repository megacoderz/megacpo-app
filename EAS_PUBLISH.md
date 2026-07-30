# Builds EAS — checklist de variáveis e publicação

# Pré-requisitos: conta Expo (`eas login`), projeto `megapartner` no org megacoderz

# (slug/display no dashboard podem ainda mostrar o ID legado `ae96404c-…` — renomear no Expo).

# Local:

# make env-init

# bun run validate:eas:preview # ou validate:eas

# Store:

# Configure EXPO_PUBLIC_API_URL (HTTPS) no dashboard EAS.

# bun run build:production:ios|android

# bun run submit:production

## Identidade (bundle)

| Campo                        | Valor                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| npm / Expo slug / scheme     | `megapartner` (`megapartner://`)                                        |
| iOS bundle / Android package | `br.com.megacoderz.megapartner.app`                                     |
| Universal Links              | `partner.megavoltz.com.br` / `hmg-partner.megavoltz.com.br` (`/entrar`) |

## Migração do listing legado (`…megacpo.app`)

Apple/Google **não** transferem instalações entre bundle IDs. Cutover:

1. Criar listing novo (App Store Connect + Play) com `br.com.megacoderz.megapartner.app`
2. Publicar o app novo; magic-link aponta para `https://partner.megavoltz.com.br/entrar`
3. Se houver usuários no listing antigo: build **sunset** com
   - `EXPO_PUBLIC_FORCE_UPGRADE=1`
   - `EXPO_PUBLIC_STORE_URL_IOS` / `EXPO_PUBLIC_STORE_URL_ANDROID` (URLs do listing **novo**)
   - bundle ID ainda `…megacpo.app` (branch/tag dedicada se necessário)
4. Após a janela (ex. 30–90 dias): arquivar listing antigo
5. Remover `megacpo` da allowlist Connect na API (`PARTNER_LEGACY_APP_SCHEME` em `partner-portal-urls.ts`) + PR de limpeza
6. Comunicação: “reinstale Mega Partner e peça novo link de acesso” (sessão SecureStore do app antigo não migra)

Se **não** houver usuários em campo no ID antigo: pular o sunset build; só checklist 1–2 + doc.
