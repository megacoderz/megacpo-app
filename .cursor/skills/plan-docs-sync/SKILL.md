---
name: plan-docs-sync
description: >-
  Sincroniza docs/ com planos implementados em .cursor/plans/. Analisa decisões,
  escopo e todos concluídos; atualiza documentação canônica (business-rules,
  technical, lgpd, product, CLAUDE.md) e propõe decisões alinhadas ao código
  entregue. Use ao concluir todos de um plano, finalizar feature derivada de
  plano, antes de marcar plano como completo, em PRs que implementam planos, ou
  quando o usuário pedir sync docs/planos.
---

# Sincronização Planos → Documentação

Mantém [`docs/`](https://github.com/megacoderz/megavoltz-docs/blob/main/README.md) alinhada ao que foi **efetivamente implementado** nos planos em [`.cursor/plans/`](https://github.com/megacoderz/megavoltz-docs/blob/main/.cursor/plans/).

**Princípio:** o plano implementado + código entregue são a fonte de verdade operacional; `docs/` deve refletir isso. Em conflito com texto desatualizado, **atualize a doc** — não reimplemente código para casar com doc obsoleta.

---

## Quando executar

| Gatilho                                                           | Ação                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| Todo(s) de plano marcado(s) `completed`                           | Sync imediato do escopo daquele todo                  |
| Plano com todos `completed`                                       | Sync completo + revisar `docs/README.md` (pendências) |
| Sessão implementou código referenciando um plano                  | Sync parcial dos domínios tocados                     |
| Usuário pede "atualizar docs", "sync plano", "documentar entrega" | Sync conforme plano indicado ou git diff              |
| PR/feature grande sem doc atualizada                              | Sync antes de encerrar a tarefa                       |

**Não adie:** sync de docs faz parte da definição de pronto (DoD) de toda entrega baseada em plano.

Planos novos devem incluir todo `quality-gates` e seção DoD — ver [`plan-quality-gates-dod`](../plan-quality-gates-dod/SKILL.md).

Planos criados ou editados devem ser adicionados ao git na mesma sessão — ver [`plan-git-track`](../plan-git-track/SKILL.md).

---

## Fluxo (obrigatório)

```
1. Identificar plano(s)     → .cursor/plans/*.plan.md (frontmatter YAML)
2. Extrair decisões         → tabelas "Decisões", escopo incluído/excluído, arquitetura
3. Quality gates            → invocar quality-gates-delivery-check (lint, build, testes)
4. Ler docs afetadas        → ver doc-map.md + links no próprio plano
5. Diff plano vs docs       → listar divergências (decisão, endpoint, entidade, fluxo)
6. Atualizar docs           → mínimo necessário; manter estilo existente
7. LGPD se aplicável        → invocar lgpd-ia-compliance para dados/terceiros novos
8. i18n se aplicável        → invocar i18n-delivery-check se api/web/mobile
9. Commit se plano completo   → invocar ai-commit-commitlint (todos completed)
10. Atualizar índice         → docs/README.md (decisões MVP, pendências, referências)
11. Reportar                → resumo: gates, plano, docs, commit (hash/subject), decisões registradas
```

---

## Como ler um plano

Frontmatter YAML (exemplo):

```yaml
name: Billing marketplace royalty
todos:
  - id: settlement-pix
    content: Cobrança PIX na liquidação...
    status: completed # pending | in_progress | completed | cancelled
```

Extrair prioritariamente:

1. **`overview`** — escopo em uma linha
2. **Todos `completed`** — o que foi entregue (granularidade por todo)
3. **Seções "Decisões confirmadas" / tabelas de entrevista** — decisões de produto/arquitetura
4. **"Fora do escopo" / "Backlog"** — o que **não** documentar como MVP
5. **Links `docs/...`** já citados no plano — candidatos naturais a atualização
6. **Diagramas e fluxos** — validar se docs de negócio/técnicas batem

Todos `pending` ou `in_progress`: documentar como **planejado**, não como entregue.

---

## Mapa plano → docs

Consulte [doc-map.md](doc-map.md) para mapeamento por domínio. Resumo:

| Domínio do plano                              | Docs primárias                                                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Billing, pagamentos, MP/Stripe, split, wallet | `business-rules/billing.md`, `technical/payment-gateways.md`, `technical/platform-monthly-fees.md`, `technical/official-sdks.md` |
| Sessões, OCPP, ociosidade                     | `business-rules/charging-sessions.md`, `technical/ocpp-and-maps.md`                                                              |
| CPO, onboarding, gateway OAuth                | `business-rules/cpo-onboarding.md`, `technical/payment-gateways.md`                                                              |
| RBAC, tenants, permissões                     | `business-rules/rbac-and-tenancy.md`, `technical/auth.md`                                                                        |
| API, erros, i18n, Swagger                     | `technical/api-conventions.md`, `technical/config-validation-i18n.md`, `technical/swagger-openapi.md`                            |
| Notificações, push, e-mail                    | `technical/notifications.md`                                                                                                     |
| Postos, tarifas                               | `business-rules/stations.md`                                                                                                     |
| Suporte                                       | `business-rules/support.md`                                                                                                      |
| LGPD, consentimento, PII                      | `lgpd/data-inventory.md`, `lgpd/privacy-controls.md`, `lgpd/acceptance-criteria.md`                                              |
| Roadmap, backlog produto                      | `product/feature-roadmap.md`, `product/requirements-backlog.md`                                                                  |
| Decisões MVP transversais                     | `docs/README.md`, [`CLAUDE.md`](../../CLAUDE.md)                                                                                 |

Se o plano introduz domínio novo sem doc: **criar** arquivo na pasta correta e linkar em `docs/README.md`.

---

## Hierarquia de decisão

Ao resolver conflitos entre fontes:

1. **Código implementado** (schema, rotas, use cases) — o que está no repo
2. **Plano com todos completed** — decisões explícitas da entrega
3. **`docs/` canônicas** — após sync, passam a refletir 1 e 2
4. **`CLAUDE.md` / `ev-hub-architect`** — atualizar quando decisões MVP mudarem
5. **Planos antigos superseded** — preferir plano mais recente no mesmo domínio

Se plano e código divergem: **corrigir docs para o código** e anotar divergência no reporte ao usuário (possível dívida técnica).

---

## Checklist de atualização por tipo de mudança

### Regras de negócio

- [ ] Fluxos (sequence/mermaid) alinhados ao implementado
- [ ] Estados, enums e transições documentados
- [ ] Escopo MVP vs backlog explícito

### Técnico

- [ ] Novas rotas em `swagger-openapi.md` (ou referência a `/docs` OpenAPI)
- [ ] Contratos de erro (`error.code`) em `api-conventions.md` se novos códigos
- [ ] Config/env novos em `config-validation-i18n.md`
- [ ] Integrações terceiros em doc dedicada (ex.: `payment-gateways.md`)

### LGPD (se feature toca PII/pagamento/localização)

- [ ] Inventário em `lgpd/data-inventory.md`
- [ ] Controles em `lgpd/privacy-controls.md`
- [ ] Critérios de aceite em `lgpd/acceptance-criteria.md`
- [ ] Skill [`lgpd-ia-compliance`](../lgpd-ia-compliance/SKILL.md) consultada

### i18n (se feature toca api/, web/ ou mobile/)

- [ ] Skill [`i18n-delivery-check`](../i18n-delivery-check/SKILL.md) executada
- [ ] Novos `error.code` em `api/src/i18n/*/errors.json` (pt-BR + en-US)
- [ ] Chaves UI/validação em `messages/*.json` ou `locales/*.json` (paridade)

### Produto

- [ ] `feature-roadmap.md` — mover itens de plano concluído
- [ ] `requirements-backlog.md` — remover/concluir requisitos entregues

### Índice

- [ ] `docs/README.md` — tabela "Decisões de produto (MVP)" e seção "Pendências"

---

## Formato de reporte (ao usuário)

Após sync, resumir em português (BR):

```markdown
## Sync plano → docs

**Plano:** [nome](.cursor/plans/arquivo.plan.md)
**Escopo:** todos X, Y concluídos | plano 100% completo

### Decisões registradas

- [decisão 1]
- [decisão 2]

### Docs atualizadas

- `docs/...` — [o que mudou em 1 linha]

### Pendências / backlog (não documentar como entregue)

- [item fora do escopo do plano]

### Ações sugeridas

- [ ] Atualizar CLAUDE.md (se decisão MVP transversal)
- [ ] Revisão DPO (se LGPD)
```

---

## Regras de escrita

1. **Idioma:** pt-BR nas docs do repo (como o restante de `docs/`)
2. **Minimal diff:** alterar só seções afetadas; não reescrever arquivos inteiros
3. **Sem duplicação:** uma decisão = um lugar canônico; demais arquivos linkam
4. **Não inventar:** se plano/código não definem algo, manter pendência explícita em `docs/README.md#Pendências`
5. **Plans permanecem:** não apagar planos; opcionalmente adicionar nota "Implementado em YYYY-MM" no topo do corpo
6. **OpenAPI:** preferir DTOs/controllers como fonte; doc markdown lista rotas de alto nível

---

## Exemplo rápido

**Plano:** `pix_top-up_carteira_0a482e3e.plan.md` (todos completed)

**Diff detectado:** doc dizia top-up síncrono; plano entregou intent + webhook + polling.

**Ações:**

- Atualizar `business-rules/billing.md` — fluxo top-up PIX com `CreditTopUpIntent`
- Atualizar `technical/payment-gateways.md` — webhook top-up, idempotência
- `docs/README.md` — confirmar PIX top-up via gateway plataforma
- LGPD — verificar se intent armazena dados mínimos

---

## Referências

- Índice docs: [`docs/README.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/README.md)
- Mapa domínio → arquivo: [doc-map.md](doc-map.md)
- Arquitetura: [`ev-hub-architect`](../ev-hub-architect/SKILL.md)
- LGPD: [`lgpd-ia-compliance`](../lgpd-ia-compliance/SKILL.md)
- Commits: [`ai-commit-commitlint`](../ai-commit-commitlint/SKILL.md)
- Planos: [`.cursor/plans/`](https://github.com/megacoderz/megavoltz-docs/blob/main/.cursor/plans/)
