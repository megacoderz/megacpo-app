---
name: commit-on-feature-branch
description: >-
  Garante que commits da IA em megacpo/ ocorram em branch nova a partir de
  main, nunca direto em main. Ao pedir push, faz push e em seguida cria o PR
  com gh. Use ao pedir commit, push, PR, ao encerrar plano, ou junto com
  ai-commit-commitlint.
---

# Commit em feature branch (nunca em `main`)

Em `megacpo/`, a política Mega Voltz é a mesma de `api/`/`web/`: **nunca** commit/push direto em `main` — só via feature branch + PR.

**Princípio:** commit → branch off `main` → (se pedir push) `git push` **e em seguida** `gh pr create`.

---

## Quando aplicar

| Gatilho                                           | Ação                                               |
| ------------------------------------------------- | -------------------------------------------------- |
| Usuário pede commit / commitar                    | Branch off `main` **antes** do commit              |
| Plano com todos `completed` (commit obrigatório)  | Idem                                               |
| Já está em feature branch com alterações          | Permanecer nela (não criar branch extra)           |
| Usuário pede **push**                             | Push da branch atual **+ criar PR** na sequência   |
| Usuário pede explicitamente commit/push em `main` | **Recusar** e explicar a política (PR obrigatório) |

---

## Fluxo commit (obrigatório, antes de `ai-commit-commitlint`)

```
1. git status + git branch --show-current
2. Se branch == main (ou master):
   a. Stash se necessário (working tree suja e checkout bloquearia)
   b. git fetch origin main
   c. git checkout main && git pull --ff-only origin main
   d. Criar branch: git checkout -b <type>/<short-slug>
   e. Restaurar stash se houver
3. Se já em feature branch ≠ main:
   - Continuar nela (não resetar para main sem pedido)
4. Só então seguir ai-commit-commitlint (stage + commit)
5. Reportar: branch + hash + subject
```

---

## Fluxo push → PR (obrigatório quando o usuário pedir push)

Pedido de **push** implica **sempre** os dois passos, nesta ordem:

```
1. Confirmar branch ≠ main/master
2. git push -u origin HEAD
3. Se já existe PR aberto para a branch → reportar URL (não duplicar)
4. Senão → gh pr create (base main) e reportar URL do PR
```

### `gh pr create` (padrão)

```bash
git push -u origin HEAD

gh pr create --base main --title "<type>(<scope>): <short description>" --body "$(cat <<'EOF'
## Summary
- <1–3 bullets do porquê / entrega>

## Test plan
- [ ] <checks relevantes — lint/typecheck/test>
EOF
)"
```

- **Title:** preferir o subject do commit (commitlint); se vários commits, resumir a entrega.
- **Base:** sempre `main`.
- **Body:** Summary + Test plan (HEREDOC).
- Analisar `git log` / `git diff main...HEAD` antes de redigir o PR.
- Retornar a **URL do PR** ao usuário.

**Não** fazer push nem abrir PR sem o usuário pedir push (ou pedir PR explicitamente — nesse caso, push se a branch ainda não estiver no remote, depois `gh pr create`).

---

## Nome da branch

Formato: `<type>/<short-slug>`

| Tipo        | Uso                                    |
| ----------- | -------------------------------------- |
| `feat/`     | Nova funcionalidade / plano de feature |
| `fix/`      | Correção                               |
| `refactor/` | Refatoração                            |
| `ci/`       | Workflows / CI                         |
| `chore/`    | Manutenção                             |
| `docs/`     | Só documentação no repo                |

**Slug:** kebab-case, curto (≤ ~40 chars), derivado do subject ou do plano.

**Exemplos:**

```
feat/partner-statement-list
fix/magic-link-session
chore/commit-on-feature-branch
```

Evitar: `main`, `master`, nomes genéricos (`update`, `changes`, `wip`).

---

## Proibido

- `git commit` / `git push` com branch atual = `main` / `master`
- `git checkout main` + commit “rápido” “só desta vez”
- Merge local em `main` sem pedido explícito do usuário
- `--force` push na `main`
- Push **sem** abrir/reattach PR na sequência (quando o usuário pediu push)

Se detectar que está em `main` no momento do commit/push → **parar**, criar branch, só então continuar.

---

## Relação com outras skills

Ordem ao encerrar plano / commit pedido:

```
quality gates → i18n → plan-docs-sync (se aplicável)
  → commit-on-feature-branch (esta skill)
  → ai-commit-commitlint
  → reporte (branch + hash)
```

Quando o usuário pedir **push**:

```
push -u origin HEAD → gh pr create (se ainda não houver PR) → reportar URL
```

- Mensagem: [`ai-commit-commitlint`](../ai-commit-commitlint/SKILL.md)
- Regra always-apply: [`.cursor/rules/commit-on-feature-branch.mdc`](../../rules/commit-on-feature-branch.mdc)
