---
name: code-review-save
description: >-
  Ao realizar code review solicitado pelo usuário, salvar o relatório completo
  em .cursor/codereview/YYYYMMDDHHmmSS.md. Use quando o usuário pedir code
  review, revisão de código, review de PR, revisão de diff ou análise de
  qualidade do repositório.
---

# Code review → arquivo markdown

Todo **code review** solicitado pelo usuário deve ser **persistido** em [`.cursor/codereview/`](../../codereview/) além de ser apresentado no chat.

**Princípio:** o chat é efêmero; o arquivo é o registro canônico da revisão.

Referência de formato: [`.cursor/codereview/20260602183443.md`](../../codereview/20260602183443.md)

---

## Quando executar

| Gatilho                                                | Ação                                     |
| ------------------------------------------------------ | ---------------------------------------- |
| "code review", "revisão de código", "review do código" | Review + salvar arquivo                  |
| "review do PR", "revisar diff", "revisar branch"       | Review do escopo + salvar                |
| Bugbot / security review solicitado explicitamente     | Salvar relatório no mesmo padrão         |
| Usuário pede só análise rápida sem salvar              | **Exceção** — salvar só se pedir arquivo |

**Padrão:** salvar **sempre** que a entrega for um code review estruturado (não uma pergunta pontual de uma linha).

---

## Fluxo (obrigatório)

```
1. Definir escopo           → diff, branch, arquivos ou repo completo
2. Executar review          → bugs, smells, segurança, arquitetura, testes
3. Gerar timestamp          → AAAAMMDDHHmmSS (ver abaixo)
4. Escrever markdown        → .cursor/codereview/<timestamp>.md
5. git add                  → git add .cursor/codereview/<timestamp>.md
6. Reportar no chat         → resumo + link/path do arquivo salvo
7. Commit?                  → só se usuário pedir (não commitar por padrão)
```

---

## Nome do arquivo

**Padrão:** `AAAAMMDDHHmmSS.md`

| Parte | Significado     |
| ----- | --------------- |
| AAAA  | Ano (4 dígitos) |
| MM    | Mês (01–12)     |
| DD    | Dia (01–31)     |
| HH    | Hora (00–23)    |
| mm    | Minuto (00–59)  |
| SS    | Segundo (00–59) |

**Exemplo:** `20260602183443.md` → 2026-06-02 18:34:43

Gerar timestamp no momento em que o arquivo é **criado**:

```bash
date +%Y%m%d%H%M%S
```

**Colisão:** se o arquivo já existir (dois reviews no mesmo segundo), acrescentar sufixo `-2`, `-3`, etc.:

```
20260703121500.md
20260703121500-2.md
```

---

## Estrutura mínima do markdown

```markdown
# Code Review — <escopo curto>

**Data:** YYYY-MM-DD HH:mm:ss (timezone local)
**Escopo:** branch | uncommitted | arquivos | repo completo
**Base:** `<branch ou ref>` (se aplicável)

---

## Veredicto executivo

| Dimensão | Avaliação |
| -------- | --------- |
| ...      | ...       |

---

## Achados

### Crítico / Alto / Médio / Baixo

(lista numerada com arquivo, linha quando possível, descrição, sugestão)

---

## Pontos positivos

- ...

---

## Recomendações

1. ...

---

## Próximos passos (opcional)

- [ ] ...
```

Adaptar seções ao escopo (MVP, módulo, PR, security-only). Manter **veredicto** e **achados** sempre.

---

## Escopo do review

| Pedido do usuário          | Escopo típico                                     |
| -------------------------- | ------------------------------------------------- |
| Sem especificar            | `git diff` branch atual vs `main`, ou uncommitted |
| "branch X"                 | `git diff main...X`                               |
| "arquivos alterados"       | diff working tree                                 |
| "repo completo" / "MVP"    | amostragem por módulo + docs + gates              |
| Módulo (`api/`, `mobile/`) | foco no diretório + integrações                   |

Mencionar no cabeçalho do arquivo qual escopo foi usado.

---

## Git

Após criar o arquivo:

```bash
git add .cursor/codereview/<timestamp>.md
```

- **Commit:** não automático — salvo pedido explícito do usuário
- Mensagem sugerida se commitar: `docs(codereview): add review snapshot for <escopo>`

---

## Reporte no chat

Ao finalizar, informar:

```markdown
## Code review salvo

- **Arquivo:** `.cursor/codereview/20260703121500.md`
- **Veredicto:** (1–2 frases)
- **Achados críticos/altos:** N
```

O chat pode trazer **resumo**; o arquivo contém o **relatório completo**.

---

## Anti-padrões

- Entregar review longo só no chat sem salvar arquivo
- Nome fora do padrão (`review.md`, `codereview-junho.md`)
- Sobrescrever review anterior (sempre novo timestamp)
- Omitir escopo/base no cabeçalho

---

## Referências

- Exemplo: [`.cursor/codereview/20260602183443.md`](../../codereview/20260602183443.md)
- Regra: [`.cursor/rules/code-review-save.mdc`](../../rules/code-review-save.mdc)
- Git add: [`plan-git-track`](../plan-git-track/SKILL.md)
