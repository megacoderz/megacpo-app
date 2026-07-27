---
name: plan-quality-gates-dod
description: >-
  Ao criar planos em .cursor/plans/, incluir lint, build e testes como DoD
  obrigatório — todo quality-gates no frontmatter e seção "Definição de pronto".
  Use ao criar novo plano, estruturar todos de plano, revisar plano sem DoD de
  qualidade, ou quando o usuário pedir template de plano.
---

# Plano novo → DoD com quality gates

Todo plano em [`.cursor/plans/`](../../plans/) que toque `api/`, `web/` ou `mobile/` **deve declarar** lint, build e testes como critério de pronto — no frontmatter (todo) **e** no corpo (seção DoD).

**Princípio:** o plano documenta o que será verificado na entrega; a execução usa [`quality-gates-delivery-check`](../quality-gates-delivery-check/SKILL.md).

---

## Quando executar

| Gatilho                                  | Ação                                      |
| ---------------------------------------- | ----------------------------------------- |
| Criar arquivo `*.plan.md` novo           | Aplicar template completo abaixo          |
| Plano existente sem todo `quality-gates` | Adicionar todo + seção DoD                |
| Plano só docs/infra (sem app)            | DoD reduzido — ver exceções               |
| Usuário pede "criar plano", "novo plano" | Incluir DoD de qualidade desde o rascunho |

---

## Todo obrigatório (frontmatter)

Incluir **sempre** como penúltimo todo funcional (antes de `docs-sync` / `plan-docs-sync`, se existir):

```yaml
- id: quality-gates
  content: >-
    Rodar lint, build/typecheck e testes nos pacotes tocados; ao fechar plano
    completo executar bun run verify
  status: pending
```

Se o plano também exige sync de docs, ordem recomendada dos todos finais:

1. `…` (escopo funcional)
2. `quality-gates`
3. `docs-sync` ou equivalente (plan-docs-sync)
4. `tests-i18n` pode ficar **antes** de quality-gates se cobrir specs + i18n juntos

---

## Seção DoD obrigatória (corpo do plano)

Incluir antes de "Fora de escopo" ou no final:

```markdown
## Definição de pronto (DoD)

### Quality gates

Executar conforme pacotes alterados ([quality-gates-delivery-check](.cursor/skills/quality-gates-delivery-check/SKILL.md)):

| Pacote    | Comandos                                                                 |
| --------- | ------------------------------------------------------------------------ |
| `api/`    | `bun run lint` → `bun run build` → `bun run test` → `bun run test:e2e`   |
| `web/`    | **`bun lint --fix`** → `bun run lint` → `bun run build` → `bun run test` |
| `mobile/` | `bun run lint` → `bun run typecheck` → `bun run test`                    |

**Web (inegociável):** após alterações, rodar `bun lint --fix` para autofix de warnings Tailwind/ESLint antes do verify.

**Plano completo (todos `completed`):** `bun run verify` na raiz (`web/`: após `bun lint --fix`).

- [ ] `bun lint --fix` no `web/` se tocado (warnings Tailwind corrigidos)
- [ ] Lint passou em todo pacote tocado
- [ ] Build (api/web) ou typecheck (mobile) passou
- [ ] Testes unitários passaram
- [ ] E2E API passou se `api/` foi alterado

### Entrega (após gates verdes)

- [ ] i18n pt-BR/en-US se api/web/mobile tocados ([i18n-delivery-check](.cursor/skills/i18n-delivery-check/SKILL.md))
- [ ] Docs sincronizadas ([plan-docs-sync](.cursor/skills/plan-docs-sync/SKILL.md))
- [ ] Commit commitlint se todos completed ([ai-commit-commitlint](.cursor/skills/ai-commit-commitlint/SKILL.md))
```

Substituir a tabela por **apenas os pacotes do escopo** (ex.: plano só mobile → só linha `mobile/`).

---

## Personalização por escopo

| Escopo do plano                         | Gates no DoD                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Só `api/`                               | Linha API + e2e                                                                                    |
| Só `web/`                               | Linha web                                                                                          |
| Só `mobile/`                            | Linha mobile                                                                                       |
| Full-stack                              | Três linhas + `verify-mvp.sh`                                                                      |
| Só `docs/`, `.cursor/`, scripts sem app | **Omitir** todo `quality-gates` e seção de app; opcional validar script se alterou `verify-mvp.sh` |
| Infra/CI                                | Incluir `bun run verify` se workflow ou script mudou                                               |

---

## Hierarquia de encerramento (referência no plano)

Incluir uma linha na seção DoD ou em "Ordem de implementação":

```
implementação → quality gates → i18n → docs sync → commit
```

---

## Anti-padrões

- Plano com todo `tests-*` mas **sem** lint/build explícitos no DoD
- Plano que toca `web/` **sem** `bun lint --fix` no DoD
- Marcar plano completo sem mencionar `verify-mvp.sh`
- DoD só com "rodar testes" genérico — listar comandos por pacote
- Quality gates **depois** de docs/commit na ordem de todos

---

## Referências

- Execução na entrega: [`quality-gates-delivery-check`](../quality-gates-delivery-check/SKILL.md)
- Regra always-apply entrega: [`.cursor/rules/quality-gates-delivery-check.mdc`](../../rules/quality-gates-delivery-check.mdc)
- Script: [`bun run verify`](../.bun run verify)
