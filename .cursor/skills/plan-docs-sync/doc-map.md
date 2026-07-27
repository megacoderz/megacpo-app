# Mapa domínio → documentação

Referência para a skill [plan-docs-sync](SKILL.md). Ao implementar um plano, use esta tabela para saber **quais arquivos revisar/atualizar**.

## Por arquivo de plano (referência cruzada)

| Plano (`.cursor/plans/`)                       | Docs principais                                                                                                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api_mega_voltz_mvp_a5107f93.plan.md`          | `technical/*`, `business-rules/*`, `docs/README.md`, `CLAUDE.md`                                                                                                                                             |
| `billing_marketplace_royalty_2f7030e3.plan.md` | `business-rules/billing.md`, `technical/payment-gateways.md`, `technical/platform-monthly-fees.md`, `technical/official-sdks.md`, `technical/notifications.md`, `lgpd/*`, `business-rules/cpo-onboarding.md` |
| `pix_top-up_carteira_0a482e3e.plan.md`         | `business-rules/billing.md`, `technical/payment-gateways.md`                                                                                                                                                 |
| `api_errors_i18n_a201b80b.plan.md`             | `technical/api-conventions.md`, `technical/config-validation-i18n.md`                                                                                                                                        |
| `validação_i18n_web_b27774c4.plan.md`          | `technical/config-validation-i18n.md`                                                                                                                                                                        |
| `backend_app_mvp_5798222e.plan.md`             | `docs/README.md`, `technical/auth.md`, route groups em `CLAUDE.md`                                                                                                                                           |
| `mobile_requisitos_35a83dda.plan.md`           | `product/requirements-backlog.md`, `business-rules/charging-sessions.md`                                                                                                                                     |
| `mega_admin_motoristas_02026bf0.plan.md`       | `business-rules/rbac-and-tenancy.md`, `product/requirements-backlog.md`                                                                                                                                      |
| `mega_admin_billing_55e19b80.plan.md`          | `business-rules/billing.md`, `technical/platform-monthly-fees.md`                                                                                                                                            |
| `crud_suporte_admin_cpo_3d9b37f4.plan.md`      | `business-rules/support.md`                                                                                                                                                                                  |
| `perfil_endereço_cep_14faf83b.plan.md`         | `lgpd/data-inventory.md`, `technical/api-conventions.md`                                                                                                                                                     |
| `app_tema_e_lacunas_mvp_7b447eda.plan.md`      | `product/requirements-backlog.md`, `product/feature-roadmap.md`                                                                                                                                              |
| `page_titles_i18n_a20c0284.plan.md`            | `technical/config-validation-i18n.md`                                                                                                                                                                        |
| `api_test_coverage_8793bbca.plan.md`           | Geralmente **sem** doc de produto; mencionar cobertura só se afetar DoD em `docs/README.md`                                                                                                                  |

## Por pasta `docs/`

### `business-rules/`

| Arquivo                | Tópicos / gatilhos de plano                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `billing.md`           | Carteira, créditos, PIX, cartão, liquidação, split, royalty, mensalidade, top-up, retry, bloqueio motorista |
| `charging-sessions.md` | RemoteStart, ociosidade, SoC, tarifas sessão, settlement trigger                                            |
| `cpo-onboarding.md`    | `/cadastro`, aprovação, consent, gateway OAuth tenant                                                       |
| `stations.md`          | Tarifas por posto, conectores, QR                                                                           |
| `support.md`           | Tickets, chat, escopo admin/CPO                                                                             |
| `rbac-and-tenancy.md`  | Permissões, roles, tenant switcher, motorista vs staff                                                      |

### `technical/`

| Arquivo                     | Tópicos / gatilhos de plano                              |
| --------------------------- | -------------------------------------------------------- |
| `payment-gateways.md`       | MP, Stripe, OAuth, webhooks, PaymentGatewayPort, split   |
| `platform-monthly-fees.md`  | Mensalidade tenant, PIX avulso, ciclos, scheduler BullMQ |
| `official-sdks.md`          | mercadopago, stripe, resend — versões e uso              |
| `api-conventions.md`        | Envelope erro, códigos, paginação, versionamento `/v1`   |
| `config-validation-i18n.md` | nestjs-i18n, class-validator, Zod, Accept-Language       |
| `swagger-openapi.md`        | Inventário rotas, DTOs, tags                             |
| `auth.md`                   | JWT, cookies BFF, refresh, claims                        |
| `ocpp-and-maps.md`          | WebSocket OCPP, Google Maps                              |
| `notifications.md`          | Push Expo, e-mail Resend, eventos billing/sessão         |
| `audit-log.md`              | Ações auditáveis (gateway, billing, admin)               |

### `lgpd/`

| Arquivo                  | Tópicos / gatilhos de plano                 |
| ------------------------ | ------------------------------------------- |
| `data-inventory.md`      | Novos campos PII, tokens pagamento, consent |
| `privacy-controls.md`    | Criptografia, retenção, anonimização        |
| `acceptance-criteria.md` | Checklist por feature implementada          |

### `product/`

| Arquivo                    | Tópicos / gatilhos de plano        |
| -------------------------- | ---------------------------------- |
| `feature-roadmap.md`       | MVP vs fase 2 após entrega         |
| `requirements-backlog.md`  | Requisitos concluídos vs pendentes |
| `competitive-landscape.md` | Raramente muda com planos técnicos |

### Raiz

| Arquivo          | Quando atualizar                                              |
| ---------------- | ------------------------------------------------------------- |
| `docs/README.md` | Decisões MVP, pendências, links novos                         |
| `CLAUDE.md`      | Decisões transversais que afetam assistentes e onboarding dev |

## Sinais no código (validar doc)

Se o plano não linkar docs explicitamente, inspecionar git diff / módulos:

| Mudança no código               | Doc provável                                     |
| ------------------------------- | ------------------------------------------------ |
| `api/prisma/schema.prisma`      | business-rules + lgpd/data-inventory             |
| `api/src/modules/billing/`      | billing.md, payment-gateways.md                  |
| `api/src/modules/platform/`     | cpo-onboarding.md, rbac, platform-monthly-fees   |
| `api/src/modules/management/`   | charging-sessions.md, ocpp-and-maps.md           |
| `api/src/i18n/`                 | config-validation-i18n.md, api-conventions.md    |
| `web/src/app/[locale]/(admin)/` | docs/README + feature específica                 |
| `mobile/`                       | requirements-backlog, billing, charging-sessions |
