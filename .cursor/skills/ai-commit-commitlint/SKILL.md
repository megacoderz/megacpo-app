---
name: ai-commit-commitlint
description: >-
  Gera e executa commits da IA no formato Conventional Commits/commitlint.
  Obrigatório ao concluir planos em .cursor/plans/ (todos completed) e quando
  o usuário pedir commit. Analisa git diff, infere type/scope, aplica protocolo
  git seguro e valida mensagem antes de commitar. Use ao commitar, ao encerrar
  implementação de plano, ou quando o usuário mencionar commitlint ou Conventional
  Commits.
---

# Commits da IA — commitlint

Garante que **todo commit feito pela IA** siga **Conventional Commits** compatível com **commitlint**, com fluxo seguro de git.

**Princípio:** mensagem descreve o **porquê** e o escopo; subject curto e imperativo; hook `commit-msg` em [`./.husky/commit-msg`](../.././.husky/commit-msg) valida via [`./commitlint.config.js`](../.././commitlint.config.js) — **nunca** `--no-verify`.

---

## Quando executar

| Gatilho                                           | Ação                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| Plano com todos `completed`                       | Commit **obrigatório** após quality gates + i18n + `plan-docs-sync` |
| Usuário pede "commit", "commitar", "gerar commit" | Commit com mensagem commitlint                                      |
| Usuário pede mensagem de commit                   | Gerar mensagem; commitar só se pedido                               |
| Review/pergunta sem alterações locais             | Não commitar                                                        |

**Ordem ao encerrar plano:** quality gates → i18n (se aplicável) → sync docs → **este fluxo** → reporte.

---

## Fluxo (obrigatório)

```
1. Verificar escopo        → git status; confirmar arquivos da implementação
2. Ler histórico           → git log -10 (estilo do repositório)
3. Analisar diff           → git diff + git diff --cached
4. Classificar             → type + scope + subject
5. Redigir mensagem        → commitlint (validar regras abaixo)
6. Excluir segredos        → .env, keys, tokens — nunca stage
7. Stage seletivo          → git add dos arquivos relevantes (incluir `.cursor/plans/*.plan.md` se alterado)
8. Commit                  → HEREDOC; nunca --no-verify
9. Hook falhou?            → corrigir e NOVO commit (não amend salvo exceção)
10. Reportar               → hash curto + subject + lista resumida
```

Executar `git status`, `git diff` e `git log` **em paralelo** quando possível.

---

## Regras commitlint

### Formato

```
<type>(<scope>): <short description>

[optional body — explica porquê ou impacto]
```

### Tipos permitidos

| Tipo       | Uso                                 |
| ---------- | ----------------------------------- |
| `feat`     | Nova funcionalidade                 |
| `fix`      | Correção de bug                     |
| `refactor` | Refatoração sem mudar comportamento |
| `perf`     | Performance                         |
| `docs`     | Só documentação                     |
| `test`     | Testes                              |
| `build`    | Build, deps, scripts Bun            |
| `ci`       | CI/CD                               |
| `chore`    | Manutenção geral                    |

### Subject

- Modo **imperativo** (`add`, `fix`, `remove` — não "added", "fixes")
- **Minúsculo** (exceto nomes próprios/acrônimos: `OCPP`, `JWT`, `PIX`)
- **Sem ponto final**
- **Máximo 72 caracteres**

### Scope (opcional)

Inferir do diff ou do plano:

| Pastas / domínio              | Scope sugerido                            |
| ----------------------------- | ----------------------------------------- |
| `api/src/modules/identity/`   | `identity`                                |
| `api/src/modules/billing/`    | `billing`                                 |
| `api/src/modules/management/` | `management`                              |
| `api/src/modules/platform/`   | `platform`                                |
| `api/` (geral)                | `api`                                     |
| `web/`                        | `web` ou subgrupo (`cpo`, `admin`, `bff`) |
| `mobile/`                     | `mobile`                                  |
| `docs/`                       | omitir scope ou `docs`                    |
| `.cursor/plans/` + código     | escopo do domínio do plano                |

Omitir scope se não houver módulo claro.

### Body

Usar quando:

- Plano grande — citar decisão principal em 1–2 linhas
- Breaking change — linha `BREAKING CHANGE: ...`
- Motivo não óbvio no subject

Separar body do subject com **linha em branco**.

---

## Plano implementado → mensagem

1. Ler frontmatter do plano (`name`, `overview`, todos `completed`)
2. Escolher **type** pelo objetivo do plano:
   - feature nova → `feat`
   - correção de gaps/review → `fix`
   - só docs → `docs`
   - refactor arquitetural → `refactor`
3. **Scope** = domínio principal (ex.: `billing`, `platform`, `white-label`)
4. **Subject** = verbo + entrega principal (não copiar título do plano inteiro)

**Exemplo — plano billing marketplace:**

```
feat(billing): implement marketplace split and royalty settlement

Add Mercado Pago split, zero-royalty path, and platform billing worker
per billing_marketplace_royalty plan.
```

**Exemplo — plano fix gaps:**

```
fix(api): close white-label and billing review gaps

Align tenant branding, BFF proxy, and worker config with plan delivery.
```

Preferir **um commit** por plano concluído. Múltiplos commits só se o usuário pedir ou se entregas forem independentes em sessões distintas.

---

## Protocolo git seguro

- **Nunca** alterar `git config`
- **Nunca** `git push --force`, `reset --hard`, ou comandos destrutivos (salvo pedido explícito)
- **Nunca** `--no-verify` / pular hooks
- **Nunca** commitar `.env`, credenciais, `*.pem`, tokens
- **Amend** só se: usuário pediu amend **ou** hook pré-commit alterou arquivos **e** HEAD foi criado pela IA nesta sessão **e** branch não foi pushada
- **Push** somente quando o usuário pedir

### Comando de commit (padrão)

```bash
git add <paths-relevantes>

git commit -m "$(cat <<'EOF'
<type>(<scope>): <short description>

Optional body line explaining why.
EOF
)"
```

Após commit: `git status` para confirmar working tree limpa (ou só arquivos intencionalmente não commitados).

---

## Detecção type/scope pelo diff

| Padrão no diff                           | Type            |
| ---------------------------------------- | --------------- |
| Novos endpoints, telas, fluxos           | `feat`          |
| Correção de bug/comportamento errado     | `fix`           |
| Só `docs/`, `.cursor/plans/` (notas)     | `docs`          |
| `*.spec.ts`, `*.test.ts`, `e2e/`         | `test`          |
| `package.json`, lockfile, Dockerfile, CI | `build` ou `ci` |
| Reorganização sem feature/fix            | `refactor`      |
| Cache, query, algoritmo                  | `perf`          |
| Config menor, limpeza                    | `chore`         |

---

## Checklist antes de commitar

- [ ] Type está na lista permitida
- [ ] Subject imperativo, minúsculo, ≤ 72 chars, sem ponto final
- [ ] Scope reflete módulo (ou omitido conscientemente)
- [ ] Nenhum segredo no stage
- [ ] i18n e docs sync feitos (se plano implementado)
- [ ] Mensagem descreve a entrega, não lista de arquivos

---

## Formato de reporte ao usuário

```markdown
### Commit

- **Hash:** `abc1234`
- **Mensagem:** `feat(billing): implement marketplace split and royalty settlement`
- **Inclui:** api billing module, docs billing.md, plan todos completed
- **Não commitado:** (se houver — ex. `.env.local` local)
```

---

## Referências

- Config: [`./commitlint.config.js`](../.././commitlint.config.js) — `@commitlint/config-conventional` + tipos do projeto
- Hook: [`./.husky/commit-msg`](../.././.husky/commit-msg) — Husky 9 na raiz do monorepo
- Regra always-apply: [`.cursor/rules/ai-commits-commitlint.mdc`](../../rules/ai-commits-commitlint.mdc)
- Sync docs (antes do commit): [`plan-docs-sync`](../plan-docs-sync/SKILL.md)
- i18n (antes do commit): [`i18n-delivery-check`](../i18n-delivery-check/SKILL.md)
- Planos: [`.cursor/plans/`](../../plans/)
