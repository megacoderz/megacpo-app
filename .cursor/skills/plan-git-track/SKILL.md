---
name: plan-git-track
description: >-
  Ao criar ou atualizar planos em .cursor/plans/, adicionar o arquivo ao git
  (git add) imediatamente. Commit só com pedido explícito ou ao encerrar plano
  completo. Use ao criar plano novo, editar todos/status de plano, ou quando o
  usuário pedir versionar plano.
---

# Planos → rastreamento git

Todo arquivo em [`.cursor/plans/*.plan.md`](../../plans/) deve ser **versionado no git** — planos não commitados se perdem no histórico do projeto.

**Princípio:** criar/atualizar plano → `git add` imediato; commit segue [`ai-commit-commitlint`](../ai-commit-commitlint/SKILL.md).

---

## Quando executar `git add`

| Gatilho                                      | Ação                                         |
| -------------------------------------------- | -------------------------------------------- |
| Plano **novo** criado                        | `git add .cursor/plans/<arquivo>.plan.md`    |
| Plano existente editado (todos, escopo, DoD) | `git add` do mesmo arquivo                   |
| Vários planos na sessão                      | `git add .cursor/plans/` ou paths explícitos |
| Usuário pede "adicione ao git"               | Stage plano(s) + demais arquivos pedidos     |

**Não adie:** executar `git add` **na mesma sessão** em que o plano foi escrito — antes de encerrar a tarefa.

---

## Fluxo (obrigatório)

```
1. Criar ou editar     → .cursor/plans/<nome>_<hash>.plan.md
2. git add plano       → git add .cursor/plans/<arquivo>.plan.md
3. git status          → confirmar arquivo em "Changes to be committed" ou staged
4. Commit?             → só se usuário pedir OU plano 100% + DoD (ai-commit-commitlint)
5. Reportar            → caminho do plano + status no git
```

---

## Comandos

Plano único:

```bash
git add .cursor/plans/nome-do-plano_<hash>.plan.md
git status --short .cursor/plans/
```

Todos os planos novos/alterados na sessão:

```bash
git add .cursor/plans/
git status --short .cursor/plans/
```

---

## Commit

| Situação                                           | Commit                                            |
| -------------------------------------------------- | ------------------------------------------------- |
| Plano recém-criado (rascunho, todos pending)       | **Não** — salvo pedido explícito do usuário       |
| Plano + implementação completa (todos `completed`) | Sim — junto com código via `ai-commit-commitlint` |
| Usuário pede "commit", "commitar"                  | Sim — incluir plano no stage se ainda não estiver |

Ao commitar plano isolado (rascunho), preferir:

```
docs(cursor): add plan for <nome curto da feature>
```

Ao commitar entrega completa, plano entra no mesmo commit da feature (`feat(...)`, `fix(...)`, etc.).

---

## Definição de pronto (DoD)

Plano **não está rastreado** enquanto:

- [ ] Arquivo existe em `.cursor/plans/*.plan.md`
- [ ] `git add` executado na sessão de criação/edição
- [ ] Agente reportou path staged ao usuário

---

## Anti-padrões

- Criar plano e encerrar sessão sem `git add`
- Deixar plano só em "Untracked files" indefinidamente
- Commitar plano com segredos (`.env`, tokens) — planos não devem conter credenciais

---

## Referências cruzadas

- DoD do plano: [`plan-quality-gates-dod`](../plan-quality-gates-dod/SKILL.md)
- Commit: [`ai-commit-commitlint`](../ai-commit-commitlint/SKILL.md)
- Regra: [`.cursor/rules/plan-git-track.mdc`](../../rules/plan-git-track.mdc)
