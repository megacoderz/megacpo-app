---
name: commit-on-feature-branch
description: >-
  Commits da IA nunca em main. Se a branch atual ≠ main, verificar se já houve
  PR mergeado dessa branch; se sim, baixar main atualizada, criar branch nova e
  só então commit/push/PR. Ao pedir push: push + gh pr create. Use ao pedir
  commit, push, PR, ao encerrar plano, ou junto com ai-commit-commitlint /
  plan-git-track.
---

# Commit em feature branch (nunca em `main`)

Em `megapartner/`, **nunca** commit/push direto em `main` — só via feature branch + PR.

**Princípio:** commit → branch off `main` (nova se a atual já foi mergeada) → (se pedir push) `git push` **e em seguida** `gh pr create`.

---

## Gate obrigatório — branch ≠ `main` já mergeada?

Sempre que a branch atual for **diferente** de `main` / `master`, **antes** de commit ou push:

```bash
BRANCH=$(git branch --show-current)
git fetch origin main
# PR(s) desta branch já mergeados em main?
MERGED_COUNT=$(gh pr list --head "$BRANCH" --base main --state merged --json number --jq 'length')
```

| Resultado                                            | Ação                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `MERGED_COUNT > 0`                                   | **Não** continuar nesta branch. Baixar `main` atualizada → criar **branch nova** → mover commits/WIP → commit/push/PR **só** na branch nova |
| `MERGED_COUNT == 0` e há PR **open** da mesma branch | Pode continuar nesta branch (mesmo PR)                                                                                                      |
| `MERGED_COUNT == 0` e sem PR                         | Pode continuar **ou** criar branch nova se o slug não servir para a entrega atual                                                           |

**Proibido** empilhar commits / fazer push em branch cujo PR já foi mergeado.

**Exceção:** o usuário pediu **explicitamente** continuar na mesma branch após merge (raro). Sem pedido explícito → branch nova off `main`.

### Migração quando já mergeada

```
1. Anotar hashes locais a preservar: git log --oneline origin/main..HEAD
2. Stash se working tree suja: git stash push -u -m "wip-before-fresh-branch"
3. git checkout main && git pull --ff-only origin main
4. git checkout -b <type>/<short-slug>   # slug NOVO — não reusar nome da branch mergeada
5. git cherry-pick <hashes> (só commits desta entrega ainda não em main)
6. git stash pop (se houver)
7. Seguir commit / push+PR nesta branch nova
8. Se existir PR open órfão na branch antiga: fechar com comentário apontando o novo PR
```

---

## Quando aplicar

| Gatilho                            | Ação                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| Usuário pede commit / commitar     | Gate acima → branch válida → commit                     |
| Plano com todos `completed`        | Idem                                                    |
| Usuário pede **push**              | Gate acima → push da branch válida **+** `gh pr create` |
| Usuário pede commit/push em `main` | **Recusar** (PR obrigatório)                            |

---

## Fluxo commit

```
1. git status + git branch --show-current
2. Se main/master:
   fetch + pull main → checkout -b <type>/<slug>
3. Se ≠ main:
   rodar gate MERGED_COUNT (seção acima)
   → se mergeada: migrar para branch nova off main
   → senão: permanecer
4. Stage + commit (Conventional Commits / ai-commit-commitlint)
5. Reportar: branch + hash + subject
```

### Escolha do slug

- Derivado **desta** entrega, kebab-case, ≤ ~40 chars.
- **Não** reutilizar nome de branch já mergeada (ex.: após merge de `fix/platform-config-branding-tzdata`, a próxima é `feat/platform-email-config`).

---

## Fluxo push → PR

```
1. Gate: branch ≠ main e não está mergeada (se estiver → migrar antes)
2. git push -u origin HEAD
3. Se já existe PR aberto para ESTA branch → reportar URL (não duplicar)
4. Senão → gh pr create (base main) e reportar URL
```

```bash
git push -u origin HEAD

gh pr create --base main --title "<type>(<scope>): <short description>" --body "$(cat <<'EOF'
## Summary
- <1–3 bullets>

## Test plan
- [ ] …
EOF
)"
```

**Não** fazer push/PR sem o usuário pedir push (ou pedir PR explicitamente).

---

## Nome da branch

Formato: `<type>/<short-slug>`

| Tipo        | Uso                         |
| ----------- | --------------------------- |
| `feat/`     | Nova funcionalidade / plano |
| `fix/`      | Correção                    |
| `docs/`     | Documentação / planos       |
| `chore/`    | Manutenção / Cursor rules   |
| `ci/`       | Workflows / CI              |
| `refactor/` | Reorganização               |

Evitar: `main`, `master`, nomes genéricos, **nomes de branches já mergeadas**.

---

## Proibido

- `git commit` / `git push` em `main` / `master`
- Continuar em branch cujo PR **já foi mergeado**
- Push em branch mergeada “para abrir outro PR com o mesmo nome”
- Merge local em `main` sem pedido explícito
- `--force` push na `main`
- Push **sem** `gh pr create` quando o usuário pediu push

---

## Relação com outras skills

```
plan-git-track
  → commit-on-feature-branch (esta skill — gate merged)
  → ai-commit-commitlint
  → reporte
```

Push pedido:

```
gate merged → push -u origin HEAD → gh pr create → reportar URL
```

- Mensagem: [`ai-commit-commitlint`](../ai-commit-commitlint/SKILL.md)
- Planos: [`plan-git-track`](../plan-git-track/SKILL.md)
- Regra: [`.cursor/rules/commit-on-feature-branch.mdc`](../../rules/commit-on-feature-branch.mdc)
