---
name: lgpd-ia-compliance
description: >-
  Guia o uso de IA para mapeamento, auditoria e documentação técnica em
  conformidade com a LGPD. Use ao iniciar novos prompts, features, histórias de
  usuário, arquitetura de dados, políticas de privacidade, termos de serviço,
  integrações com terceiros ou quando o usuário mencionar LGPD, privacidade,
  dados pessoais, DPO ou soberania de dados.
---

# LGPD + IA — Conformidade no Desenvolvimento

## Papel da IA

Integrar IA ao processo de desenvolvimento para **mapeamento, auditoria e documentação técnica** — não apenas para gerar código. O sucesso depende de combinar velocidade da IA com arquitetura que isole dados sensíveis em zonas controladas (_Privacy by Design_).

**Aviso:** Saídas jurídicas (políticas, termos, bases legais) são rascunhos técnicos. Recomende sempre revisão do DPO ou assessoria jurídica antes de publicação.

---

## Fluxo ao iniciar um novo prompt ou feature

```
1. Inventariar dados pessoais no escopo
2. Definir finalidade e base legal por dado
3. Gerar critérios de aceite de privacidade
4. Propor arquitetura com isolamento de dados sensíveis
5. Avaliar infraestrutura e transferência internacional
6. Estimar impacto de custo de conformidade
7. Rascunhar/atualizar documentação legal alinhada ao técnico
```

---

## 1. Mapeamento de dados e finalidade

### Inventário automático

Analise histórias de usuário, requisitos ou código proposto e liste:

| Dado | Categoria (Art. 5º LGPD)                     | Sensível? | Origem                  | Destino/terceiros          |
| ---- | -------------------------------------------- | --------- | ----------------------- | -------------------------- |
| ...  | identificação, financeiro, localização, etc. | sim/não   | formulário, API, sensor | banco, analytics, parceiro |

### Justificativa de coleta

Para cada dado identificado, documente:

- **Finalidade específica** (evitar coleta excessiva — princípio da necessidade)
- **Base legal** aplicável
- **Prazo de retenção**
- **Se pode ser anonimizado/pseudonimizado** sem perder a finalidade

### Prompt modelo para inventário

```
Analise o escopo abaixo e produza inventário LGPD:
- Dados pessoais coletados
- Finalidade de cada dado
- Base legal sugerida (indicar incerteza)
- Riscos de coleta excessiva
- Sugestões de minimização

Escopo: [história de usuário / descrição da feature]
```

---

## 2. Evitando dívida técnica de segurança

### Anti-padrão: "vibe coding"

Gerar aplicações via prompts sem engenharia rigorosa cria fragilidade em:

- Criptografia e gestão de chaves
- Controle de acesso e autorização
- Logs com PII
- Anonimização reversível

### Revisão obrigatória

Marque explicitamente o que exige **revisão de engenharia sênior** antes de merge:

- Autenticação e autorização
- Criptografia em repouso e em trânsito
- Mascaramamento/anonimização de identificadores
- Integrações que exportam PII

### Critérios de aceite de privacidade

Gere critérios testáveis por funcionalidade. Exemplo:

```markdown
**Feature:** Envio de telemetria do motorista

- [ ] O ID do motorista é pseudonimizado antes do envio ao serviço de telemetria
- [ ] Logs do serviço não contêm nome, CPF ou geolocalização precisa
- [ ] Retenção máxima de 90 dias, com job de expurgo automatizado
- [ ] Consentimento registrado com timestamp e versão da política
```

---

## 3. Infraestrutura e soberania de dados

### Preferências

- Dados em **território nacional** quando possível (Magalu Cloud, GERTI Cloud ou equivalente)
- Jurisdição brasileira simplifica requisitos de transferência internacional (Arts. 33–36 LGPD)
- Documentar subprocessadores e localização de processamento

### Checklist de infraestrutura

- [ ] Região de armazenamento definida (preferencialmente BR)
- [ ] Transferência internacional mapeada e justificada
- [ ] Contratos/DPA com provedores identificados
- [ ] Criptografia e backup com mesma classificação de sensibilidade
- [ ] Relatórios de monitoramento alimentam o DPO (incidentes, acessos, retenção)

---

## 4. Gestão de custos de conformidade

- Impacto típico: **15%–30%** sobre o custo total quando há conformidade regulatória robusta
- Use estimativas explícitas para: auditorias, pentest, revisão de arquitetura, DPO/consultoria
- **MVP:** implemente apenas controles essenciais ao escopo atual
- Adie para versões posteriores: motores de recomendação com PII, profiling avançado, IA sensível

### Template de estimativa

```markdown
| Item               | Essencial no MVP? | Esforço (dias) | Custo estimado |
| ------------------ | ----------------- | -------------- | -------------- |
| Inventário e ROPA  | sim               |                |                |
| Criptografia + IAM | sim               |                |                |
| Pentest            | não (pós-MVP)     |                |                |
| DPO/consultoria    | parcial           |                |                |
```

---

## 5. Documentação de políticas e termos

### Rascunho alinhado ao técnico

A IA pode gerar rascunhos de:

- Política de Privacidade
- Termos de Serviço
- Aviso de cookies / consentimento
- Registro de operações de tratamento (ROPA)

### Auditoria de políticas

Verifique coerência entre documentação e implementação:

- Dados listados na política existem no código?
- Finalidades declaradas correspondem ao uso real?
- Terceiros/integrações estão declarados?
- Requisitos de lojas (Apple App Store, Google Play) atendidos?

Apps sem políticas adequadas podem ser **rejeitados** nas lojas — sinalize gaps antes do release.

---

## Arquitetura recomendada

```
┌─────────────────────────────────────────┐
│  Zona pública (sem PII)                 │
│  APIs de conteúdo, catálogo, estáticos   │
└─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│  Zona de identidade (PII isolada)       │
│  Auth, perfil, consentimento, preferências│
└─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────┐
│  Zona sensível (dados especiais)        │
│  Saúde, biometria, financeiro — cripto   │
└─────────────────────────────────────────┘
```

- Microserviços ou módulos com fronteiras claras
- Tokens/opacos em vez de PII em serviços downstream
- Princípio do menor privilégio em APIs internas

---

## Formato de resposta sugerido

Ao analisar um prompt ou feature, estruture a resposta assim:

```markdown
## Inventário de dados

[tabela]

## Riscos LGPD identificados

- ...

## Critérios de aceite de privacidade

- [ ] ...

## Recomendações de arquitetura

- ...

## Infraestrutura e soberania

- ...

## Documentação pendente

- ...

## Próximos passos (DPO/jurídico)

- ...
```

---

## Referência rápida LGPD

| Princípio         | Aplicação prática                        |
| ----------------- | ---------------------------------------- |
| Finalidade        | Coletar só para propósito explícito      |
| Adequação         | Compatível com a finalidade              |
| Necessidade       | Mínimo indispensável                     |
| Transparência     | Informar o titular claramente            |
| Segurança         | Medidas técnicas e administrativas       |
| Prevenção         | Antecipar riscos no design               |
| Responsabilização | Demonstrar conformidade (accountability) |
