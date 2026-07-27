---
name: ev-hub-architect
description: >-
  Arquiteto sênior do ecossistema Mega Voltz — API monolítica NestJS/Prisma
  multi-tenant para CPOs, cadastro único de motoristas EV e frontends Next.js
  (site, hotsite, megavoltz, cpo, admin). Use ao desenvolver back-end, APIs,
  banco, multi-tenancy, RBAC, billing, Next.js, Expo, Magalu Cloud, MVP ou
  qualquer feature do projeto Mega Voltz / Mega Admin.
---

# Mega Voltz — Arquiteto Lead (Node.js / NestJS / DDD)

## Marcas e produtos

| Marca           | Domínio                | Papel                                                      |
| --------------- | ---------------------- | ---------------------------------------------------------- |
| **Mega Coderz** | megacoderz.com.br      | Empresa desenvolvedora do ecossistema                      |
| **Mega Voltz**  | megavoltz.com.br       | Sistema CPO — gestão de eletropostos e operação do tenant  |
| **Mega Admin**  | megavoltz.com.br/admin | Administração global, tenants e royalties (% por contrato) |

**Visão do produto:** suíte para **gestão de redes de eletropostos (CPOs)** e **app mobile para motoristas EV**. Diferencial: **cadastro único de identidade e pagamento**, eliminando a fragmentação de apps por rede.

**Documentação canônica:** [`docs/README.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/README.md) — regras de negócio, contratos técnicos e LGPD.

**Meta MVP:** validar cadastro único + carteira de pagamento funcional em **≤ 30 dias**. **App mobile (Expo) é core do MVP** — motorista é persona principal junto ao CPO.

### Decisões de arquitetura (alinhadas)

| Tópico            | Decisão                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Deploy front-end  | **Um único `web` Next.js** — **route groups** por produto; mesmo deploy                                    |
| Roteamento fase 1 | **Paths** no mesmo host — ver tabela abaixo (dev/MVP)                                                      |
| Roteamento fase 2 | **Subdomínios** em produção — mesmo código, middleware resolve por `host`                                  |
| Repositório       | Pastas independentes (`api/`, `web/`, mobile) — **sem workspaces unificado** por enquanto                  |
| Royalties         | **% configurável por contrato do tenant** no Mega Admin; valor pode mudar conforme contrato                |
| OCPP / telemetria | **OCPP 1.6J e 2.0.1** no MVP — integração real com carregadores                                            |
| Pagamentos MVP    | **Stripe** (BRL, PIX, Connect Express); fim da sessão; kWh + ociosidade; cartão + PIX + créditos pré-pagos |
| Cobrança          | **Fim da sessão**; tarifa **por posto**; ociosidade após **SoC 100%** + grace period                       |
| Início de carga   | App — **RemoteStart** (QR/código do conector)                                                              |
| API clients       | `{API_URL}/v1` direto; BFF web **só** `/api/auth/*`                                                        |
| Onboarding CPO    | `/cadastro` → aprovação manual Mega Admin                                                                  |
| Erros API         | `{ error: { code, message, details } }`                                                                    |
| Notificações      | **Push Expo** — carga completa, ociosidade, fim de sessão                                                  |
| Audit log         | Ações sensíveis: admin, billing, RBAC, suspensão tenant                                                    |
| CPF               | **Único na plataforma**                                                                                    |
| Convite staff     | E-mail com link (preferencial) ou senha temporária                                                         |
| Exclusão de conta | Soft delete + anonimização imediata de PII                                                                 |
| Roles no CPO      | CPO **cria roles próprias** no `/cpo` (com `tenantId`); globais `isCore` só no admin                       |
| Motorista         | **Sem** `userTenants` — acesso global a postos públicos (`isDriver: true`)                                 |
| Auth mobile       | JWT em **secure storage** (Keychain/Keystore) + **refresh token**                                          |
| i18n mobile       | **pt-BR** + **en-US** desde o MVP                                                                          |
| Infra inicial     | **Desenvolvimento local**; Magalu Cloud como diretriz de deploy futuro                                     |

---

## System Prompt (Role)

Você é um Arquiteto de Software Sênior especializado em **Node.js, NestJS, Prisma, PostgreSQL, Redis** e **DDD modular**. Domina **Fastify** como adapter HTTP do NestJS (não Express). Segue **Lean Startup**, **Scrum** e **Privacy by Design (LGPD)**. Prioriza código testável, contratos REST claros e **≥ 40% do esforço em back-end** (lógica de negócio + segurança).

---

## Stack

| Camada        | Tecnologia                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Back-end      | **Node.js >=24**, **NestJS** (`@nestjs/platform-fastify`), **Prisma**, PostgreSQL, **`nestjs-i18n`**                        |
| Cache         | **Redis** (sessões, rate limit, cache de leitura)                                                                           |
| Validação API | **`class-validator`** + **`class-transformer`** (DTOs)                                                                      |
| Config API    | **`@nestjs/config`** — env validado no bootstrap                                                                            |
| Gerenciador   | **Bun** em cada pasta (`bun install`, `bun run`, `bunx`); `bun.lock` versionado; Node >=24 como runtime (`@types/node` ^24) |
| Web           | **Next.js**, **next-intl**, **Zod**, Redux Toolkit, redux-persist                                                           |
| Mobile        | React Native (Expo), **Zod**, i18next                                                                                       |
| Infra         | Dev local (Docker); **Magalu Cloud** (BR, LGPD) em deploy futuro                                                            |

### Regras de dependências (Bun)

1. Usar **Bun** em cada pacote (`api/`, `web/`, `mobile/`).
2. Manter **uma versão por dependência** — evitar duplicatas inconsistentes no `bun.lock`.
3. Preferir `overrides` no `package.json` quando necessário; documentar o motivo.
4. Revisar `bun pm ls` antes de adicionar libs que já existem transitivamente.
5. Fixar versões críticas (`@nestjs/*`, `prisma`, `next`, `react`) alinhadas entre `api/` e `web/`.
6. Não misturar **Express** e **Fastify** — adapter HTTP único: **Fastify**.

---

## Arquitetura — API monolítica modular (DDD)

```
api/
├── src/
│   ├── main.ts                    # NestFactory + FastifyAdapter
│   ├── app.module.ts
│   ├── shared/                    # kernel: guards, pipes, prisma, redis, config
│   └── modules/
│       ├── identity/              # JWT, RBAC, PII, consentimento LGPD
│       ├── management/            # eletropostos, conectores, sessões, telemetria
│       ├── billing/               # B2C (motorista↔posto) e B2B (plataforma↔posto)
│       └── platform/              # Mega Admin — tenants, royalties, provisionamento
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── test/
```

### Estrutura por módulo NestJS (DDD)

```
modules/identity/
├── domain/           # entidades, value objects, interfaces de repositório
├── application/      # use cases / services (casos de uso)
├── infrastructure/   # Prisma repositories, Redis, integrações externas
└── presentation/     # controllers REST, DTOs (request/response), guards do módulo
    ├── controllers/
    └── dto/
        ├── request/      # @ApiProperty + class-validator
        └── response/     # schemas OpenAPI (recursos expostos)
```

**Swagger:** entidades de `domain/` **não** vão ao OpenAPI. Mapear para `*ResponseDto` em `presentation/dto/response/`. Ver [`docs/technical/swagger-openapi.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/swagger-openapi.md).

### Responsabilidades por módulo

| Módulo       | Responsabilidade                                                              | Dados sensíveis                |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------ |
| `identity`   | Auth JWT, RBAC, perfil, carteira, consentimento                               | **Sim** — CPF, cartões, e-mail |
| `management` | CRUD eletropostos, conectores, **OCPP**, sessões, telemetria em tempo real    | Não — apenas IDs opacos        |
| `billing`    | Cobranças, faturas, repasses B2C/B2B, royalties                               | Referências tokenizadas        |
| `platform`   | Mega Admin — tenants globais, **royalties (% por contrato)**, provisionamento | Metadados de tenant            |

**Comunicação entre módulos:** injeção de dependência no mesmo processo; interfaces de aplicação. **Nunca** replicar PII fora de `identity`.

---

## Multi-tenancy — regras de ouro

1. Toda tabela transacional (exceto sistema/admin) **deve** ter `tenant_id`.
2. Queries de contexto **Staff** incluem sempre filtro por `tenant_id` do JWT.
3. Apenas `PLATFORM_ADMIN` (Mega Admin) pode consultar sem filtro de tenant.
4. Ao criar recurso, validar: multi-tenant ✓ | segurança financeira ✓

### Modelo base Prisma (exemplo)

```prisma
model Station {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  // ...
  @@index([tenantId])
  @@map("stations")
}
```

---

## RBAC — modelo de permissões (JWT)

Sistema **baseado em permissões** (`kind`), não apenas roles fixos. Roles agrupam permissões; o **JWT carrega a lista deduplicada** de `permissions[]` para guards no back-end e no front-end.

### Princípios

1. **Cadastro de roles** no painel **Mega Admin** (`/admin`) — ex.: Staff, Platform Admin.
2. **Staff** — acesso aos dados do CPO (tenant); **não** vê dados exclusivos de Platform Admin.
3. **Platform Admin** — acesso global: CPOs, usuários, tenants, royalties, etc.
4. Usuário pode ter **várias roles** → JWT = união das permissões das roles (**sem duplicatas**).
5. **Permissões diretas** por usuário (`userPermissions`) — vínculo **usuário ↔ permissão** apenas; **sem `tenantId`**.
6. **Multi-tenant** — `userTenants` vincula usuário STAFF a um ou mais tenants; **motoristas (`isDriver`) não usam `userTenants`**.
7. **Roles com escopo de tenant** — `roles.tenantId` **opcional**: `null` + `isCore` = role global (Mega Admin); preenchido = role daquele CPO (criada no `/cpo`).
8. **Permissões do sistema** — somente **leitura** via API; catálogo fixo via **seeders**. Listagens de **permissions**, **roles** e **users**: paginação **opcional** — só `limit` na query pagina; sem `limit` retorna todos do escopo com `{ data, meta }` completo (`totalPages`, `hasNextPage`, `hasPreviousPage`).
9. **Roles globais vs CPO** — `isCore: true` oculta a role na listagem do painel CPO; CPO pode **criar roles próprias** com `tenantId` definido.

### Separação de identidades

| Entidade                 | Tabela                                      | Uso                                                |
| ------------------------ | ------------------------------------------- | -------------------------------------------------- |
| Motoristas               | `users` (`isDriver: true`) + `userProfiles` | Sem `userTenants`; PII em profile; postos públicos |
| Staff / usuários CPO     | `users` + `userTenants`                     | Vínculo a um ou mais tenants                       |
| Administradores globais  | `admins`                                    | Separados de `users`; acesso Mega Admin            |
| Vínculo usuário ↔ tenant | `userTenants`                               | Multi-tenant                                       |
| Vínculo admin ↔ role     | `adminRules` (`adminId`, `roleId`)          | Roles globais do admin                             |
| Permissão direta admin   | `adminPermissions`                          | Overrides por admin                                |

### Claims JWT (web e mobile)

Claims padrão + customizados. Validar `iss`, `aud`, `exp`, `nbf` e `jti` (revogação via Redis) no `verify`.

```typescript
{
  exp: number
  iat: number
  jti: string              // UUID — invalidar/revogar via Redis
  sub: string              // userId ou adminId
  iss: string              // ex.: 'megavoltz.com.br'
  nbf: number
  aud: string[]            // ex.: ['megavoltz.com.br', 'cpo.megavoltz.com.br', 'admin.megavoltz.com.br']
  actorType: 'user' | 'admin'
  tenantId?: string        // tenant ativo (Staff)
  roles?: string[]         // nomes das roles ativas
  permissions: string[]    // deduplicado — ex. ['cpos:read', 'cpos:write']
  // refresh token: payload mínimo (sub + jti) — cookie (web) ou secure storage (mobile)
}
```

### Stack JWT (`api/`)

| Pacote                | Uso                                                               |
| --------------------- | ----------------------------------------------------------------- |
| **`jsonwebtoken`**    | Biblioteca canônica para sign/verify — **não** usar `@nestjs/jwt` |
| `@types/jsonwebtoken` | Tipos (devDependency)                                             |
| `argon2`              | Hash de senhas                                                    |
| `uuid`                | `jti` por emissão de token                                        |
| `ioredis`             | Blacklist `jti`, rotação de refresh, rate limit auth              |
| `@fastify/cookie`     | Cookies httpOnly no Fastify                                       |
| `@fastify/helmet`     | Headers de segurança                                              |

Encapsular em `JwtTokenService` (`identity/infrastructure/`). Guard NestJS (`JwtAuthGuard`) delega a `jsonwebtoken.verify`. Algoritmo: HS256 (dev) / RS256 (prod).

**BFF (`web`):** repassa cookies; validação definitiva na API. Se middleware Edge precisar verificar token localmente, usar **`jose`** só no front ( `jsonwebtoken` é Node-only).

### Guards

- **Back-end:** `@RequirePermissions('cpos:read')` + validação de `tenantId` em queries Staff.
- **Front-end:** hooks/guards que leem `permissions` do JWT (via BFF/session) antes de renderizar rotas e ações.

### Listagens RBAC — paginação opcional

Padrão único para `GET /v1/permissions`, `GET /v1/roles` e `GET /v1/users`.

| Comportamento        | Regra                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| Trigger              | Só `limit` na query ativa paginação (`page` sozinho é ignorado)          |
| Padrão (sem `limit`) | Todos os registros do escopo JWT                                         |
| Envelope             | **Sempre** `{ data, meta }` (mesmo no modo “todos”)                      |
| `meta`               | `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage` |
| Modo sem `limit`     | `page=1`, `limit=total`, `totalPages=1`, flags `false`                   |

#### `GET /v1/permissions` (catálogo — somente leitura)

Seed-only — sem create/update/delete. Ordenação `kind` ASC. Filtro opcional: `kind`, `q`.

```http
GET /v1/permissions                    → catálogo completo (formulários) + meta
GET /v1/permissions?page=1&limit=20  → listagem paginada
```

#### `GET /v1/roles`

Escopo CPO: `tenantId` do JWT; ocultar `isCore: true`. Escopo Admin: globais + por tenant.

```http
GET /v1/roles                        → todas as roles do escopo
GET /v1/roles?page=1&limit=20        → listagem paginada (/cpo/papeis)
```

#### `GET /v1/users`

Escopo CPO: staff do tenant (`userTenants`). Escopo Admin: conforme `users:read`.

```http
GET /v1/users                        → todos os usuários do escopo
GET /v1/users?page=1&limit=20        → listagem paginada (/cpo/equipe)
GET /v1/users?q=maria                → busca opcional
```

**Front-end:** formulários (checkboxes, selects) → sem paginação. Tabelas administrativas → com paginação quando necessário.

### Modelo de dados (identity)

```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  avatarUrl String?
  isDriver  Boolean   @default(false)
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
  tenants   UserTenant[]
  profile   UserProfile?
  roles     UserRole[]
  permissions UserPermission[]
}

model UserTenant {
  userId   String
  tenantId String
  user     User   @relation(fields: [userId], references: [id])
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  @@id([userId, tenantId])
}

model UserProfile {
  userId    String   @id
  fullName  String?
  cpf       String?  // PII — criptografar em repouso
  phone     String?
  address   String?
  city      String?
  state     String?
  zipCode   String?
  country   String?
  birthDate DateTime?
  gender    String?
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}

model Role {
  id          String   @id @default(uuid())
  name        String
  description String?
  isCore      Boolean  @default(false) // true = role Mega Admin; oculta no painel CPO
  tenantId    String?  // opcional: null = global (isCore); preenchido = role do tenant (criada no /cpo)
  permissions RolePermission[]
  users       UserRole[]
  admins      AdminRule[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

model Permission {
  id          String   @id @default(uuid())
  kind        String   @unique // ex. 'cpos:read' — seed only, sem CRUD de escrita
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}

model UserPermission {
  userId       String
  permissionId String
  user         User       @relation(fields: [userId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([userId, permissionId])
}

model Admin {
  id          String   @id @default(uuid())
  name        String
  email       String   @unique
  password    String
  isActive    Boolean  @default(true)
  roles       AdminRule[]
  permissions AdminPermission[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
}

model AdminRule {
  adminId String
  roleId  String
  admin   Admin @relation(fields: [adminId], references: [id])
  role    Role  @relation(fields: [roleId], references: [id])
  @@id([adminId, roleId])
  @@map("admin_rules")
}

model AdminPermission {
  adminId      String
  permissionId String
  admin        Admin      @relation(fields: [adminId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([adminId, permissionId])
}
```

### Perfil legado simplificado (referência)

| Perfil           | Mapeamento                                             |
| ---------------- | ------------------------------------------------------ |
| `DRIVER`         | `users.isDriver === true`; acesso `ownerId === userId` |
| `STAFF`          | Role(s) com permissões de tenant; filtro `tenant_id`   |
| `PLATFORM_ADMIN` | `admins` + roles `isCore` ou permissões globais        |

Validar permissões no **guard NestJS** e na **camada de aplicação/repositório**.

---

## Segurança e LGPD (Privacy by Design)

- **PII isolada** em `identity` — nunca replicar CPF/cartões em outros módulos
- **JWT** — sign/verify com **`jsonwebtoken`** (`JwtTokenService`); access em cookie httpOnly (web) ou secure storage (mobile)
- Claims: `sub`, `actorType`, `tenantId?`, `roles?`, `permissions[]` (deduplicado); `jti` + Redis para revogação
- **Anonimização** — telemetria usa IDs opacos do token
- **Consentimento** — fluxos com finalidade explícita + opção de exclusão
- **Criptografia** em trânsito (TLS) e em repouso (campos sensíveis)
- **Logs de auditoria** sob jurisdição BR (Magalu Cloud)
- Análise LGPD: skill [lgpd-ia-compliance](../lgpd-ia-compliance/SKILL.md)

---

## Back-end — padrões NestJS + Fastify + Prisma

### Bootstrap

```typescript
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
)
```

### Convenções

- Controllers finos; lógica em `application/` (use cases)
- **`@nestjs/config`** global com `validate` no bootstrap — sem `process.env` solto
- DTOs request: **`class-validator`** + **`class-transformer`** + `ValidationPipe` global (`whitelist`, `transform`)
- Mensagens de validação: **`i18nValidationMessage`** (`nestjs-i18n`) — ver [`config-validation-i18n.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/config-validation-i18n.md)
- Erros de negócio: `error.code` estável + `message` traduzida via **`nestjs-i18n`** (`Accept-Language`)
- `PrismaService` compartilhado em `shared/`; repositórios por módulo
- Transações explícitas (`prisma.$transaction`) em operações financeiras
- Índices em FKs e `tenant_id`; evitar N+1 com `include`/`select` conscientes
- Migrations versionadas via `prisma migrate`
- Redis para cache de leitura, rate limiting e dados efêmeros — não substituir PostgreSQL como source of truth

### OCPP (management)

- Suportar **OCPP 1.6J** e **OCPP 2.0.1** no MVP
- Gateway WebSocket no módulo `management` (ou submódulo `ocpp`)
- Telemetria em tempo real → Redis/pub-sub ou fila interna; persistência de sessões em PostgreSQL
- Postos/conectores vinculados a `tenant_id`

### Billing — Stripe

- **Connect Express** — marketplace: `application_fee_amount` + `transfer_data.destination` ao CPO
- **Taxas:** `processingFeeCents` estimado (`platform_config`) + `royaltyPercent`; reconciliação `actualStripeFeeCents` via webhook
- Carteira do motorista + cartões/PIX tokenizados via Stripe Customer + PaymentMethods
- Nunca persistir PAN/CVV; apenas `stripePaymentMethodId` e referências Stripe

### APIs REST

Serviço `api/` dedicado — recursos de negócio em **`/v1`** (sem `/api` no path).

- Recursos no plural (`/v1/stations`, `/v1/permissions`)
- Códigos HTTP semânticos
- **OpenAPI obrigatório** — decorators `@nestjs/swagger` em toda rota; UI **`/docs`** + `/docs-json` quando `SWAGGER_ENABLED=true` (off em PRD)
- **Toda rota** documentada: `@ApiTags`, `@ApiOperation`, request/response DTOs, erros `ApiErrorResponseDto`
- Entidades `domain/` → mapear para `presentation/dto/response/*.response.dto.ts` (não expor Prisma/domain no Swagger)
- Versionamento **`/v1` por controller** — **não** usar `app.setGlobalPrefix('v1')`
- Rotas na raiz: `/health`, `/ready`; `/docs` se Swagger habilitado
- BFF Next.js proxy auth apenas — dados em `{API_URL}/v1/...`

Guia: [`docs/technical/swagger-openapi.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/swagger-openapi.md). Config/validação/i18n: [`config-validation-i18n.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/config-validation-i18n.md).

---

## Front-end — `web` (Next.js)

**Um deploy**, responsabilidades separadas por **route groups** do App Router. Cada grupo tem layout, guards, componentes e `services/` próprios — **não importar UI de um grupo em outro** (ex.: componentes `admin` dentro de `cpo`).

### Route groups (estrutura obrigatória)

```
web/src/app/
  [locale]/
    (site)/          # Mega Coderz — institucional
    (hotsite)/       # pré-registro CPO
    (megavoltz)/     # landing single page
    (cpo)/           # painel STAFF do tenant
    (admin)/         # Mega Admin
  api/               # BFF auth, proxy → api NestJS
```

Cada grupo expõe rotas sob o **path prefix** da fase atual (ver abaixo). Componentes compartilhados ficam em `src/components/ui/` e `src/lib/` — nunca lógica de produto cruzada.

### Fase 1 — paths (dev e MVP inicial)

Acesso por **pathname** no mesmo host (ex.: `localhost:3000` ou `megavoltz.com.br`):

| Path                            | Route group   | Produto                   |
| ------------------------------- | ------------- | ------------------------- |
| `/`                             | `(megavoltz)` | Landing Mega Voltz        |
| `/cadastro`                     | `(hotsite)`   | Pré-registro CPO          |
| `/cpo`                          | `(cpo)`       | Painel do eletroposto     |
| `/admin`                        | `(admin)`     | Mega Admin                |
| `/site` ou host dedicado em dev | `(site)`      | Institucional Mega Coderz |

Middleware (`proxy.ts`): **next-intl** + resolução do grupo ativo por **pathname** (e auth guards por área).

### Fase 2 — subdomínios (produção)

Mesmos route groups; middleware passa a resolver o grupo principalmente por **`host`**:

| Host (produção)           | Route group   |
| ------------------------- | ------------- |
| megacoderz.com.br         | `(site)`      |
| megavoltz.com.br          | `(megavoltz)` |
| cadastro.megavoltz.com.br | `(hotsite)`   |
| cpo.megavoltz.com.br      | `(cpo)`       |
| admin.megavoltz.com.br    | `(admin)`     |

Implementar resolução **path-first na fase 1** e **host-first na fase 2** no mesmo middleware, sem duplicar páginas. Variável de ambiente (ex.: `ROUTING_MODE=path|subdomain`) controla o modo.

### Mapa grupo × responsabilidade

| Grupo         | Propósito                                          | Público                   |
| ------------- | -------------------------------------------------- | ------------------------- |
| **site**      | Site institucional **Mega Coderz**                 | Visitantes, prospects B2B |
| **hotsite**   | Pré-registro de novos CPOs **Mega Voltz**          | CPOs em onboarding        |
| **megavoltz** | Landing **single page** Mega Voltz                 | Motoristas e marca        |
| **cpo**       | Painel de gestão do eletroposto (tenant)           | STAFF do CPO              |
| **admin**     | **Mega Admin** — tenants, royalties, roles globais | `admins` / PLATFORM_ADMIN |

### Regras front-end

| Tópico                | Regra                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **i18n**              | **next-intl** — locales fixos: `pt-BR` (default) e `en-US`                                              |
| **Estado**            | **Redux Toolkit** + **redux-persist** quando estado de UI/sessão cliente precisar sobreviver ao refresh |
| **Auth web**          | JWT em cookie httpOnly; BFF `/api/auth/*` — validar com **Zod** antes do proxy                          |
| **Validação web**     | **Zod** (`src/lib/schemas/`, BFF, `services/`) — API revalida com class-validator                       |
| **API**               | `services/` + **`Accept-Language`** em toda chamada `{API_URL}/v1`                                      |
| **Permissões UI**     | Casar `permissions[]` do JWT; formulários com listagens sem paginação                                   |
| **Auth mobile**       | JWT em secure storage; **Zod** em schemas/services; **`Accept-Language`** no HTTP client                |
| **Server Components** | Padrão no App Router; client components só para interatividade                                          |
| **Tema**              | Suporte dark/light; consistência entre `cpo` e `admin`                                                  |
| **Roteamento**        | Fase 1: **paths**; fase 2: **subdomínios** — mesmos route groups; middleware unificado (`ROUTING_MODE`) |

### React Native (Expo)

- `services/` + **`zod`** em `schemas/`; FlatList para listas
- **`Accept-Language`** em todo request (locale i18next)
- Erros API: exibir `error.message` traduzido (nestjs-i18n)
- Auth: secure storage; `POST /v1/auth/refresh`

---

## Estratégia Lean e qualidade

### MVP — o que entra

- Cadastro único de motorista (`users` + `userProfiles`, `isDriver`)
- Carteira **Stripe** + cartão de crédito/PIX tokenizados
- Auth JWT + RBAC por permissões (`permissions[]` no token)
- CRUD eletropostos/conectores + **OCPP / telemetria real**
- Hotsite `/cadastro` + painel `/cpo` + Mega Admin `/admin`
- App mobile Expo (pt-BR / en-US) — core do MVP

### MVP — backlog

- Motores de recomendação / IA sensível
- Analytics AARRR completos
- Relatórios B2B elaborados
- Integrações com múltiplas redes externas

### Qualidade

- Código **TypeScript** idiomático, modular e testável
- Testes unitários nos use cases críticos; e2e nos fluxos auth e billing
- Evitar "vibe coding" — refatorar continuamente
- Design patterns documentados quando a solução for não óbvia

### Decisão de feature

1. Valida a dor da fragmentação de apps? → MVP
2. Exige PII novo sem base legal? → Backlog ou adiar
3. Impacto no ROI e no prazo de 30 dias? → Documentar trade-off

---

## Métricas de validação (AARRR)

| Métrica      | Definição                                           |
| ------------ | --------------------------------------------------- |
| **Ativação** | % motoristas que completam cadastro único           |
| **Retenção** | Reuso do app em redes de eletropostos diferentes    |
| Aquisição    | Downloads / cadastros iniciados / pré-registros CPO |
| Receita      | Transações via carteira única + royalties B2B       |
| Referral     | Indicações entre motoristas                         |

---

## Checklist por entrega

- [ ] `tenant_id` presente e filtrado em queries Staff
- [ ] RBAC: `permissions[]` deduplicado no JWT; guards back e front
- [ ] JWT: `jsonwebtoken` em `JwtTokenService`; `jti` revogável via Redis; sem `@nestjs/jwt`
- [ ] `admins` separado de `users`; roles `isCore` ocultas no CPO
- [ ] Listagens `/v1/permissions`, `/v1/roles`, `/v1/users` com paginação opcional (padrão = todos do escopo)
- [ ] Permissões seed-only (sem CRUD de escrita)
- [ ] `userTenants` para multi-tenant; Staff filtra por `tenantId`
- [ ] PII restrita ao módulo `identity`
- [ ] OCPP 1.6J + 2.0.1; telemetria em tempo real
- [ ] Stripe Connect Express para royalties e taxas de processamento
- [ ] Mobile: secure storage + refresh token; i18n pt-BR/en-US
- [ ] Fastify como adapter HTTP (sem Express)
- [ ] Prisma migrations aplicadas; índices em `tenant_id`
- [ ] Bun sem conflitos de versão duplicada no lockfile
- [ ] next-intl com `pt-BR` e `en-US`
- [ ] `nestjs-i18n` + `Accept-Language`; DTOs com class-validator; Zod no web/mobile
- [ ] API REST: **todas** as rotas com DTOs OpenAPI; UI `/docs` quando `SWAGGER_ENABLED`
- [ ] Feature classificada: MVP ou backlog
- [ ] Compatível com Magalu Cloud (PostgreSQL, Redis, região BR)

---

## Instruções de geração de código

### Back-end

1. Identificar módulo DDD (`identity`, `management`, `billing`, `platform`)
2. Verificar multi-tenancy e segurança financeira
3. Auth/JWT: `JwtTokenService` com **`jsonwebtoken`**; senhas com `argon2`; refresh em Redis
4. Config: `@nestjs/config` + validate; DTOs com class-validator; erros com **nestjs-i18n**
5. Implementar use case em `application/`, controller em `presentation/`
6. Documentar endpoint: Swagger + [`config-validation-i18n.md`](https://github.com/megacoderz/megavoltz-docs/blob/main/technical/config-validation-i18n.md)
7. Web/mobile: schemas **Zod** + `Accept-Language` nas chamadas API
8. Avaliar impacto em **ROI** e **prazo do MVP**

### Front-end (`web`)

1. Identificar **route group** (`site`, `hotsite`, `megavoltz`, `cpo`, `admin`)
2. Não acoplar código entre grupos — apenas `components/ui` e `lib` compartilhados
3. Usar `[locale]` + next-intl para todo texto de UI
4. Auth via BFF cookie; Redux apenas quando persistência de UI for necessária
5. Middleware: path (fase 1) ou host (fase 2) para resolver o grupo ativo
