---
name: i18n-delivery-check
description: >-
  Verifica internacionalização ao implementar planos ou alterar api/, web/
  ou mobile/. Confere códigos de erro nestjs-i18n, chaves pt-BR (fallback), en-US
  e es-ES nos JSON de idiomas, mensagens Zod/next-intl/i18next e ausência de strings
  hardcoded. Use ao concluir todos de plano, antes de encerrar feature, em PRs
  que tocam erros/UI/validação, ou quando o usuário pedir revisão i18n.
---

# Verificação i18n na entrega

Garante que **erros, validações e textos de UI** estejam internacionalizados em **pt-BR** (fallback), **en-US** e **es-ES**, com chaves sincronizadas nos arquivos JSON de cada camada.

**Princípio:** `error.code` é estável (não traduzir no cliente); `error.message` vem da API via `Accept-Language`. UI local usa chaves nos JSON — **nunca** strings fixas em português/inglês no JSX/TSX (exceto dados de negócio ou placeholders técnicos documentados).

Referência canônica: [`docs/technical/config-validation-i18n.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/config-validation-i18n.md)

---

## Quando executar

| Gatilho                                            | Ação                                      |
| -------------------------------------------------- | ----------------------------------------- |
| Todo(s) de plano marcado(s) `completed`            | Verificar i18n do escopo daquele todo     |
| Plano 100% completo ou feature encerrada           | Verificação completa das camadas tocadas  |
| Alteração em `api/`, `web/`, `mobile/`             | Verificar só o que mudou no diff          |
| Novo `apiError(...)`, DTO, formulário, tela ou BFF | Verificação obrigatória antes de encerrar |
| Usuário pede "revisar i18n", "traduzir erros"      | Fluxo completo conforme camada            |

**Não adie:** faz parte do DoD junto com [`plan-docs-sync`](../plan-docs-sync/SKILL.md).

---

## Fluxo (obrigatório)

```
1. Identificar camadas tocadas   → git diff ou escopo do plano
2. Inventariar novos códigos/chaves → apiError, DTOs, t(), useTranslations
3. Conferir JSON pt-BR + en-US + es-ES → paridade de chaves em todos os três locales
4. Caçar anti-padrões            → strings hardcoded, ApiException com message EN
5. Corrigir gaps                 → adicionar chaves faltantes antes de encerrar
6. Reportar                      → resumo ao usuário (ver formato abaixo)
```

---

## Camada `api/` — nestjs-i18n

### Arquivos de catálogo

| Arquivo                              | Conteúdo                                       |
| ------------------------------------ | ---------------------------------------------- |
| `api/src/i18n/pt-BR/errors.json`     | Mensagens de `apiError(code)` → chave = `code` |
| `api/src/i18n/en-US/errors.json`     | Paridade obrigatória com pt-BR                 |
| `api/src/i18n/es-ES/errors.json`     | Paridade com pt-BR e en-US                     |
| `api/src/i18n/pt-BR/validation.json` | Chaves `validation.*` para DTOs                |
| `api/src/i18n/en-US/validation.json` | Paridade com pt-BR                             |
| `api/src/i18n/es-ES/validation.json` | Paridade com pt-BR e en-US                     |

### Regras

1. **Erros de negócio:** usar `throw apiError('CODE_GRANULAR', status)` — **sem** mensagem em inglês no código ([`api-error.ts`](../../api/src/shared/domain/api-error.ts)).
2. **Código = chave:** cada `CODE` em `apiError` **deve existir** em `errors.json` (pt-BR, en-US **e** es-ES).
3. **Códigos granulares:** preferir `USER_NOT_FOUND` a `NOT_FOUND` com mensagem diferente por contexto.
4. **DTOs:** `@IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })` — chave em `validation.json`.
5. **Filter:** [`api-exception.filter.ts`](../../api/src/shared/filters/api-exception.filter.ts) traduz via `errors.${code}`; chave ausente → `__MISSING__` (bug).

### Checklist API

- [ ] Todo `apiError('X'` novo tem `X` em `pt-BR/errors.json`, `en-US/errors.json` e `es-ES/errors.json`
- [ ] Nenhum `throw new ApiException(..., 'English message', ...)` novo
- [ ] Novas chaves `validation.*` em **todos** os três locales (pt-BR, en-US, es-ES)
- [ ] Mensagens pt-BR naturais; en-US idiomáticas (não tradução literal ruim)
- [ ] Novos `error.code` documentados em `docs/technical/api-conventions.md` se estáveis para clientes

### Comandos úteis (diff da sessão)

```bash
# Códigos apiError no diff
git diff --name-only | rg '^api/' && rg "apiError\('([A-Z0-9_]+)'" api/src -o --no-filename | sort -u

# ApiException legado (anti-padrão)
rg "new ApiException\(" api/src --glob '!*.spec.ts'

# i18nValidationMessage no diff
rg "i18nValidationMessage\('validation\.([^']+)'" api/src

# Verificar paridade i18n (incluindo es-ES)
bun run i18n:check
```

---

## Camada `web/` — next-intl

### Arquivos de catálogo

| Arquivo                   | Conteúdo                             |
| ------------------------- | ------------------------------------ |
| `web/messages/pt-BR.json` | UI, metadata, namespaces por feature |
| `web/messages/en-US.json` | **Mesma árvore de chaves** que pt-BR |
| `web/messages/es-ES.json` | Paridade com pt-BR e en-US           |

### Namespaces principais

| Namespace                               | Uso                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `common`                                | Ações globais (salvar, cancelar, loading)                                                        |
| `auth`                                  | Login, portais                                                                                   |
| `validation`                            | Mensagens Zod via [`getValidationTranslator`](../../web/src/lib/validation/create-translator.ts) |
| `admin`, `cpo`, `support`, `hotsite`, … | Feature por route group                                                                          |

### Regras

1. **Componentes:** `useTranslations('namespace')` ou `getTranslations` (RSC) — chaves em `messages/*.json`.
2. **Validação Zod:** schemas via factories em `src/lib/validation/schemas/*` que recebem tradutor — **não** defaults Zod em inglês.
3. **BFF** (`src/app/api/auth/*`): erros 422 com mensagem do namespace `validation` + locale do request.
4. **Chamadas API:** header `Accept-Language` alinhado ao locale next-intl.
5. **Paridade:** toda chave nova em pt-BR **deve** existir em en-US **e** es-ES (mesmo path JSON).

### Checklist web

- [ ] Textos visíveis ao usuário usam `t('...')`, não string literal
- [ ] Novas chaves em **todos** `messages/pt-BR.json`, `messages/en-US.json` e `messages/es-ES.json`
- [ ] Formulários com Zod usam schemas i18n + `FormFieldError` quando aplicável
- [ ] Namespace `validation` atualizado se novas regras Zod
- [ ] Metadata/títulos de página em `metadata` namespace quando nova rota

### Comandos úteis

```bash
# useTranslations namespaces no diff
rg "useTranslations\(['\"]([^'\"]+)['\"]" web/src

# Strings suspeitas em JSX (heurística — revisar manualmente)
rg "(>|\"|\')([A-ZÁÉÍÓÚÀ][a-záéíóúàãõç]+ [a-záéíóúàãõç]+)" web/src --glob '*.tsx'

# Verificar paridade i18n (incluindo es-ES)
bun run i18n:check
```

---

## Camada `mobile/` — i18next

### Arquivos de catálogo

| Arquivo                         | Conteúdo                   |
| ------------------------------- | -------------------------- |
| `mobile/src/locales/pt-BR.json` | UI motorista               |
| `mobile/src/locales/en-US.json` | Paridade com pt-BR         |
| `mobile/src/locales/es-ES.json` | Paridade com pt-BR e en-US |

### Regras

1. **Componentes:** `useTranslation()` → `t('section.key')` com chaves nos JSON.
2. **Labels dinâmicos:** [`app-labels.ts`](../../mobile/src/utils/app-labels.ts) — preferir chaves i18next; fallback `APP_LABELS` só para branding/env.
3. **Validação Zod:** mensagens via i18n antes do submit — não exibir `error.message` cru do Zod em inglês.
4. **Erros API:** exibir `error.message` da API (já traduzido); fallback local por `error.code` só se offline.
5. **HTTP:** `Accept-Language: i18n.language` em todas as requests.

### Checklist mobile

- [ ] Novas telas/strings em **todos** pt-BR.json, en-US.json e es-ES.json
- [ ] Sem texto fixo PT/EN em componentes (exceto `{{appName}}` e env branding)
- [ ] Chaves aninhadas consistentes (`auth.login`, `map.title`, …)
- [ ] Locales pt-BR, en-US e es-ES com mesmas chaves

---

## Anti-padrões (rejeitar)

| Anti-padrão                                    | Correção                               |
| ---------------------------------------------- | -------------------------------------- |
| `apiError('X')` sem `X` em errors.json         | Adicionar em pt-BR, en-US e es-ES      |
| `ApiException(code, 'Hardcoded English', ...)` | Migrar para `apiError(code, status)`   |
| Zod `.email()` / `.min()` sem tradutor         | Factory em `lib/validation` ou i18next |
| `t('novaChave')` sem JSON                      | Adicionar nos três locales             |
| Só pt-BR e en-US atualizados                   | Sempre todos: pt-BR + en-US + es-ES    |
| UI exibe só `error.code`                       | Exibir `error.message` da API          |
| BFF retorna `"Invalid input"` fixo             | Usar `getValidationTranslator(locale)` |

---

## Verificação de paridade JSON

Ao adicionar chaves, confirmar que **pt-BR, en-US e es-ES têm a mesma estrutura**:

1. Abrir ambos os arquivos lado a lado
2. Para cada path novo (`admin.tenants.brandingTitle`), existir nos três
3. Valores diferentes por idioma — **chaves idênticas**

Comando para verificação (requer `jq`):

```bash
# Exemplo web — listar chaves folha
for locale in pt-BR en-US es-ES; do
  jq -r 'paths(scalars) | map(tostring) | join(".")' web/messages/${locale}.json | sort > /tmp/${locale}.keys
done

# Comparar pt-BR com en-US
diff /tmp/pt-BR.keys /tmp/en-US.keys

# Comparar pt-BR com es-ES
diff /tmp/pt-BR.keys /tmp/es-ES.keys
```

Repetir para `api/src/i18n/*/errors.json`, `api/src/i18n/*/validation.json` e `mobile/src/locales/*.json`.

---

## Integração com planos

Ao executar [`plan-docs-sync`](../plan-docs-sync/SKILL.md):

1. **Antes** do sync de docs, concluir esta verificação i18n
2. Se novos `error.code` estáveis, incluir em `docs/technical/api-conventions.md` no sync
3. Reportar i18n **e** docs no encerramento da tarefa

---

## Formato de reporte (ao usuário)

Após verificação, resumir em português (BR):

```markdown
## Verificação i18n

**Escopo:** api | web | mobile (camadas tocadas)
**Origem:** plano X | diff da sessão

### Chaves adicionadas/corrigidas

- `api` — `TENANT_BRANDING_INCOMPLETE` em pt-BR/en-US/es-ES
- `web` — `admin.tenants.branding` namespace (pt-BR/en-US/es-ES)
- `mobile` — `branding.previewTitle` (pt-BR/en-US/es-ES)

### Gaps corrigidos

- [o que estava faltando e foi criado]

### Pendências (se houver)

- [item que ficou fora do escopo — ex.: copy legal aguardando jurídico]

### Anti-padrões eliminados

- [ex.: removido ApiException com message EN]
```

---

## Referências

- [`docs/technical/config-validation-i18n.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/config-validation-i18n.md)
- [`docs/technical/api-conventions.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/api-conventions.md)
- Plano API errors: [`.cursor/plans/api_errors_i18n_a201b80b.plan.md`](../../plans/api_errors_i18n_a201b80b.plan.md)
- Plano web validation: [`.cursor/plans/validação_i18n_web_b27774c4.plan.md`](../../plans/validação_i18n_web_b27774c4.plan.md)
- [`plan-docs-sync`](../plan-docs-sync/SKILL.md) — DoD de entrega
