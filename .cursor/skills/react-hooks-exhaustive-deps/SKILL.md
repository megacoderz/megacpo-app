---
name: react-hooks-exhaustive-deps
description: >-
  Orienta o uso correto de react-hooks/exhaustive-deps em React e React Native.
  Ensina quando omitir funções (load, fetch, bootstrap) do array de dependências
  e aplicar eslint-disable-next-line pontual, em vez de incluir a função e
  reexecutar o efeito a cada render. Use ao escrever ou revisar useEffect,
  useFocusEffect, useMemo, useCallback, ao ver o aviso exhaustive-deps, ou
  quando o usuário mencionar deps de hooks / eslint-disable em efeitos.
---

# react-hooks/exhaustive-deps

Evita loops e re-fetches desnecessários causados por “completar” o array com funções recriadas a cada render.

## Princípio

O array deve listar **valores que, ao mudarem, devem re-disparar o efeito** (ids, locale, params, flags). Funções locais que só encapsulam essa lógica **não** precisam entrar no array — use disable pontual.

## Fluxo de decisão

```
1. O efeito usa um valor (state/prop/param)?
   → Sim e falta no array → ADICIONE a dep
2. O lint pede uma função definida no mesmo componente (load, fetchX…)?
   → A função só usa deps já listadas?
      → Sim → omita a função + eslint-disable-next-line
      → Não → adicione as deps faltantes OU useCallback com deps corretas
3. Efeito só na montagem?
   → [] + disable com -- intentional mount-only
```

## Padrão canônico (web / RN)

```tsx
const load = () => {
  // usa stationId, locale (já nas deps do efeito)
  void stationsService.listConnectors(stationId, locale).then(setConnectors)
}

useEffect(() => {
  load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [stationId, locale])
```

Comentário **logo acima** da linha do array. Aceito também:

```tsx
/* eslint-disable-next-line react-hooks/exhaustive-deps */
```

Motivo opcional (preferível em mount-only):

```tsx
// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
```

## Exemplos do monorepo

- Web CPO: `postos/[id]/conectores/page.tsx` — `load()` com `[stationId, locale]`
- Web CPO: `postos/[id]/page.tsx` — `load()` com `[id, locale]`
- Mobile: `map.tsx` — bootstrap mount-only com `[]`

## O que NÃO fazer

- Incluir `load` / `fetch` no array só para silenciar o lint (nova ref a cada render)
- `eslint-disable` no arquivo inteiro para `react-hooks/exhaustive-deps`
- Omitir **valores** reais usados no efeito (isso é bug, não exceção)
- Trocar por `useCallback(load, [])` vazio quando `load` lê props/state que mudam

## Checklist rápido

- [ ] Deps de **dados** estão completas
- [ ] Função omitida de propósito (não por descuido)
- [ ] Disable é **next-line**, com comentário na linha do array
- [ ] Se o callback for passado a filhos / `useFocusEffect`, preferir `useCallback` com deps reais
