---
name: quality-gates-delivery-check
description: >-
  Executa lint, typecheck e testes antes de encerrar implementação. Use ao
  concluir plano, feature ou sessão com alterações de código.
---

# Quality gates — Mobile

```bash
bun run verify
```

Ordem: lint → typecheck → test. Corrigir falhas antes de i18n, docs ou commit.
