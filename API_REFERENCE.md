# Juntai Hermes — API Reference

> Documento de referência para o **Juntai Console** e demais clientes externos.  
> Base URL: `http://localhost:3000` (dev) · `https://api.juntai.app` (prod)  
> Todos os timestamps são ISO 8601 UTC. Todos os IDs são UUID v4.

---

## Índice

1. [Autenticação](#1-autenticação)
2. [Erros](#2-erros)
3. [Usuários](#3-usuários)
4. [Restaurantes & Filiais](#4-restaurantes--filiais)
5. [Cardápio](#5-cardápio)
6. [Mesas & Sessões](#6-mesas--sessões)
7. [Pedidos](#7-pedidos)
8. [Pagamentos](#8-pagamentos)
9. [Realtime (WebSocket)](#9-realtime-websocket)
10. [Mapa de Permissões](#10-mapa-de-permissões)
11. [Fluxos de Uso — Juntai Console](#11-fluxos-de-uso--juntai-console)

---

## 1. Autenticação

A API usa **autenticação stateless por headers**. Não há sessão de cookie. O servidor resolve um `Actor` em cada requisição com base nos headers recebidos.

### 1.1 Staff (OWNER / MANAGER / WAITER)

```
Authorization: Bearer <token>
X-Restaurant-Id: <restaurantId>
X-Location-Id: <locationId>
```

- `<token>` é o `rawToken` retornado em **uma única vez** ao criar um Staff Token (`POST /users/:id/staff-tokens`).
- O token é válido enquanto não expirar (`expiresAt` pode ser `null` = nunca expira).
- **OWNER** tem acesso irrestrito ao restaurante informado no header.
- **MANAGER / WAITER** precisam ter um `userLocationRole` na filial informada.

### 1.2 Cliente de mesa (SESSION_USER)

```
X-Session-User-Id: <sessionUserId>
```

- `sessionUserId` é o `id` retornado em `POST /sessions/:id/join`.
- Dá acesso apenas à sessão desse usuário.

### 1.3 Sem autenticação (GUEST)

Qualquer requisição sem headers acima é tratada como `GUEST`. A maioria das rotas protegidas retorna `403` para GUEST.

---

## 2. Erros

Todas as respostas de erro seguem o formato:

```json
{
  "code": "SESSION_CLOSED",
  "message": "SESSION_CLOSED"
}
```

| HTTP  | Situação                       |
| ----- | ------------------------------ |
| `400` | Validação de entrada (Zod)     |
| `403` | Sem permissão (policy)         |
| `404` | Recurso não encontrado         |
| `409` | Conflito (ex: email duplicado) |
| `422` | Regra de negócio violada       |

### Códigos de erro de negócio

| Código                        | HTTP | Descrição                         |
| ----------------------------- | ---- | --------------------------------- |
| `EMAIL_ALREADY_IN_USE`        | 409  | E-mail já cadastrado              |
| `USER_NOT_FOUND`              | 404  | Usuário não existe                |
| `SLUG_ALREADY_IN_USE`         | 409  | Slug de restaurante em uso        |
| `RESTAURANT_NOT_FOUND`        | 404  | Restaurante não existe            |
| `LOCATION_NOT_FOUND`          | 404  | Filial não existe                 |
| `MENU_NOT_FOUND`              | 404  | Menu não existe                   |
| `CATEGORY_NOT_FOUND`          | 404  | Categoria não existe              |
| `MENU_ITEM_NOT_FOUND`         | 404  | Item não existe ou indisponível   |
| `MODIFIER_GROUP_NOT_FOUND`    | 404  | Grupo de modificadores não existe |
| `MODIFIER_NOT_FOUND`          | 404  | Modificador inválido no pedido    |
| `INVALID_MODIFIER_LIMITS`     | 422  | Limites de seleção inválidos      |
| `QRCODE_NOT_FOUND`            | 404  | QR Code não encontrado            |
| `SESSION_NOT_FOUND`           | 404  | Sessão não existe                 |
| `SESSION_CLOSED`              | 422  | Sessão já encerrada               |
| `SESSION_USER_NOT_IN_SESSION` | 404  | Usuário não pertence à sessão     |
| `SESSION_USER_ALREADY_LINKED` | 409  | Usuário já vinculado              |
| `SESSION_USER_NOT_FOUND`      | 404  | SessionUser não existe            |
| `ORDER_NOT_FOUND`             | 404  | Pedido não existe                 |
| `INVALID_STATUS_TRANSITION`   | 422  | Transição de status inválida      |
| `FORBIDDEN`                   | 403  | Sem permissão                     |

---

## 3. Usuários

### `POST /users`

Cria um novo usuário na plataforma.

**Auth:** Nenhuma (ou OWNER para fluxo administrativo)

**Body:**

```json
{
  "name": "Pablo Silva",
  "email": "pablo@juntai.app",
  "phone": "+5511999999999",
  "globalRole": "STAFF"
}
```

| Campo        | Tipo                   | Obrigatório | Notas               |
| ------------ | ---------------------- | ----------- | ------------------- |
| `name`       | string (1–100)         | ✅          |                     |
| `email`      | string (email)         | ✅          | único na plataforma |
| `phone`      | string                 | ❌          |                     |
| `globalRole` | `"OWNER"` \| `"STAFF"` | ❌          | default `"STAFF"`   |

**Response `201`:**

```json
{
  "id": "uuid",
  "name": "Pablo Silva",
  "email": "pablo@juntai.app",
  "phone": null,
  "avatarUrl": null,
  "globalRole": "STAFF",
  "createdAt": "2026-04-08T00:00:00.000Z"
}
```

---

### `GET /users/:userId`

Retorna dados de um usuário.

**Auth:** Staff

**Response `200`:** mesmo shape do `POST /users`.

---

### `POST /users/:userId/staff-tokens`

Gera um token de autenticação para staff. O `token` em texto puro é retornado **uma única vez** — armazene com segurança.

**Auth:** OWNER (recomendado)

**Body (opcional):**

```json
{ "label": "iPad Caixa" }
```

**Response `201`:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "token": "3f8a2c...",
  "tokenHash": "sha256...",
  "label": "iPad Caixa",
  "expiresAt": null,
  "createdAt": "2026-04-08T00:00:00.000Z"
}
```

> ⚠️ Guarde o campo `token`. Ele não é recuperável depois.

---

### `POST /users/:userId/location-roles`

Atribui papel (MANAGER ou WAITER) a um usuário em uma filial específica.

**Auth:** OWNER

**Body:**

```json
{
  "restaurantId": "uuid",
  "locationId": "uuid",
  "role": "WAITER"
}
```

| Campo  | Valores                   |
| ------ | ------------------------- |
| `role` | `"MANAGER"` \| `"WAITER"` |

**Response `201`:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "restaurantId": "uuid",
  "locationId": "uuid",
  "role": "WAITER"
}
```

---

### `PATCH /users/:userId/session-user`

Vincula um `SessionUser` (cliente da mesa) a um usuário autenticado da plataforma.

**Auth:** Staff ou SESSION_USER

**Body:**

```json
{
  "sessionUserId": "uuid",
  "clientToken": "uuid"
}
```

**Response `200`:** `SessionUser` atualizado com `userId` preenchido.

---

## 4. Restaurantes & Filiais

### `POST /restaurants`

Cadastra um novo restaurante parceiro.

**Auth:** OWNER (admin da Juntai)

**Body:**

```json
{
  "name": "Boteco do Zé",
  "slug": "boteco-do-ze",
  "logoUrl": "https://cdn.example.com/logo.png",
  "coverUrl": "https://cdn.example.com/cover.png",
  "settings": {
    "type": "BAR",
    "allowAnonymous": true,
    "requireApproval": false,
    "currency": "BRL"
  }
}
```

| Campo                      | Tipo                        | Obrigatório | Notas                                                        |
| -------------------------- | --------------------------- | ----------- | ------------------------------------------------------------ |
| `name`                     | string (1–200)              | ✅          |                                                              |
| `slug`                     | string (1–100, `[a-z0-9-]`) | ✅          | único; usado em URLs                                         |
| `logoUrl`                  | URL                         | ❌          |                                                              |
| `coverUrl`                 | URL                         | ❌          |                                                              |
| `settings.type`            | enum                        | ❌          | `BAR` \| `RESTAURANT` \| `RODIZIO` \| `CAFETERIA` \| `EVENT` |
| `settings.allowAnonymous`  | boolean                     | ❌          | default `true`                                               |
| `settings.requireApproval` | boolean                     | ❌          | default `false`                                              |
| `settings.currency`        | string                      | ❌          | default `"BRL"`                                              |

**Response `201`:**

```json
{
  "id": "uuid",
  "name": "Boteco do Zé",
  "slug": "boteco-do-ze",
  "logoUrl": null,
  "coverUrl": null,
  "settings": {
    "type": "BAR",
    "allowAnonymous": true,
    "requireApproval": false,
    "currency": "BRL"
  },
  "createdAt": "2026-04-08T00:00:00.000Z"
}
```

---

### `GET /restaurants/:restaurantId`

Retorna dados do restaurante.

**Auth:** Staff do restaurante

**Response `200`:** mesmo shape do `POST /restaurants`.

---

### `POST /restaurants/:restaurantId/locations`

Cadastra uma filial do restaurante.

**Auth:** OWNER

**Body:**

```json
{
  "name": "Unidade Paulista",
  "phone": "+5511999990000",
  "logoUrl": null,
  "address": {
    "street": "Av. Paulista",
    "number": "1500",
    "complement": "2º andar",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "postalCode": "01311-000",
    "country": "BR",
    "lat": -23.5613,
    "lng": -46.6563
  }
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "name": "Unidade Paulista",
  "address": { ... },
  "phone": null,
  "logoUrl": null,
  "isActive": true,
  "createdAt": "2026-04-08T00:00:00.000Z"
}
```

---

### `GET /restaurants/:restaurantId/locations`

Lista todas as filiais do restaurante.

**Auth:** Staff do restaurante

**Response `200`:** array de `Location`.

---

### `GET /restaurants/:restaurantId/locations/:locationId`

Retorna uma filial específica.

**Auth:** Staff do restaurante

**Response `200`:** objeto `Location`.

---

## 5. Cardápio

A hierarquia é: **Menu → Categoria → Item → ModifierGroup → ModifierOption**

Menus são por filial (`locationId`). Um item sem `locationId` seria compartilhado pela rede (não implementado na v1).

---

### `POST /restaurants/:restaurantId/menus`

Cria um menu para uma filial.

**Auth:** OWNER / MANAGER

**Body:**

```json
{
  "name": "Cardápio de Verão",
  "locationId": "uuid",
  "displayOrder": 0
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "locationId": "uuid",
  "name": "Cardápio de Verão",
  "isActive": true,
  "displayOrder": 0,
  "createdAt": "2026-04-08T00:00:00.000Z"
}
```

---

### `POST /menus/:menuId/categories`

Cria uma categoria dentro de um menu.

**Auth:** OWNER / MANAGER

**Body:**

```json
{
  "restaurantId": "uuid",
  "name": "Petiscos",
  "displayOrder": 1
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "menuId": "uuid",
  "restaurantId": "uuid",
  "name": "Petiscos",
  "displayOrder": 1,
  "isActive": true
}
```

---

### `PATCH /categories/:categoryId`

Atualiza nome, ordem ou estado de uma categoria.

**Auth:** OWNER / MANAGER

**Body (todos opcionais):**

```json
{
  "restaurantId": "uuid",
  "name": "Petiscos & Tira-gostos",
  "isActive": false,
  "displayOrder": 2
}
```

**Response `200`:** `Category` atualizada.

---

### `DELETE /categories/:categoryId`

Desativa uma categoria (soft delete — a categoria some do cardápio mas os dados são preservados).

**Auth:** OWNER / MANAGER

**Body:**

```json
{ "restaurantId": "uuid" }
```

**Response `204`:** sem body.

---

### `POST /categories/:categoryId/items`

Cria um item dentro de uma categoria.

**Auth:** OWNER / MANAGER

**Body:**

```json
{
  "restaurantId": "uuid",
  "name": "Batata Frita Crocante",
  "description": "Batata palito frita com sal e ervas",
  "basePrice": 22.9,
  "imageUrl": "https://cdn.example.com/batata.jpg",
  "mediaUrls": ["https://cdn.example.com/batata2.jpg"],
  "displayOrder": 0
}
```

| Campo          | Tipo              | Obrigatório    |
| -------------- | ----------------- | -------------- |
| `restaurantId` | UUID              | ✅             |
| `name`         | string (1–200)    | ✅             |
| `description`  | string (max 1000) | ❌             |
| `basePrice`    | number (positivo) | ✅             |
| `imageUrl`     | URL               | ❌             |
| `mediaUrls`    | URL[]             | ❌             |
| `displayOrder` | int               | ❌ default `0` |

**Response `201`:**

```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "restaurantId": "uuid",
  "name": "Batata Frita Crocante",
  "description": "Batata palito frita com sal e ervas",
  "basePrice": 22.9,
  "imageUrl": null,
  "mediaUrls": null,
  "isAvailable": true,
  "displayOrder": 0,
  "createdAt": "2026-04-08T00:00:00.000Z"
}
```

---

### `PATCH /items/:itemId`

Atualiza um item do cardápio.

**Auth:** OWNER / MANAGER

**Body (todos opcionais):**

```json
{
  "restaurantId": "uuid",
  "name": "Batata Frita Especial",
  "basePrice": 25.9,
  "isAvailable": false,
  "displayOrder": 1
}
```

> Setar `isAvailable: false` remove o item do cardápio sem excluí-lo.

**Response `200`:** `MenuItem` atualizado.

---

### `DELETE /items/:itemId`

Remove um item permanentemente do banco.

**Auth:** OWNER / MANAGER

**Body:**

```json
{ "restaurantId": "uuid" }
```

**Response `204`:** sem body.

---

### `POST /restaurants/:restaurantId/modifier-groups`

Cria um grupo de modificadores (ex: "Ponto da Carne", "Extras", "Molhos").

**Auth:** OWNER / MANAGER

**Body:**

```json
{
  "name": "Ponto da Carne",
  "selectionType": "SINGLE",
  "isRequired": true,
  "minSelections": 1,
  "maxSelections": 1
}
```

| Campo           | Tipo                       | Notas                                  |
| --------------- | -------------------------- | -------------------------------------- |
| `selectionType` | `"SINGLE"` \| `"MULTIPLE"` | SINGLE: apenas 1 opção                 |
| `isRequired`    | boolean                    | se `true`, `minSelections` deve ser ≥1 |
| `minSelections` | int ≥0                     | default `0`                            |
| `maxSelections` | int positivo               | opcional                               |

**Response `201`:**

```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "name": "Ponto da Carne",
  "selectionType": "SINGLE",
  "isRequired": true,
  "minSelections": 1,
  "maxSelections": 1
}
```

---

### `POST /modifier-groups/:groupId/options`

Adiciona uma opção a um grupo de modificadores.

**Auth:** OWNER / MANAGER

**Body:**

```json
{
  "restaurantId": "uuid",
  "name": "Ao Ponto",
  "priceDelta": 0,
  "displayOrder": 0
}
```

| Campo        | Tipo   | Notas                        |
| ------------ | ------ | ---------------------------- |
| `priceDelta` | number | pode ser negativo (desconto) |

**Response `201`:**

```json
{
  "id": "uuid",
  "modifierGroupId": "uuid",
  "name": "Ao Ponto",
  "priceDelta": 0,
  "isAvailable": true,
  "displayOrder": 0
}
```

---

### `POST /items/:itemId/modifier-groups/:groupId`

Vincula um grupo de modificadores a um item do cardápio.

**Auth:** OWNER / MANAGER

**Body:**

```json
{ "restaurantId": "uuid" }
```

**Response `204`:** sem body.

---

### `GET /restaurants/:restaurantId/locations/:locationId/menu`

Retorna o cardápio completo de uma filial, montado em árvore com categorias, itens e modificadores.

**Auth:** Qualquer (incluindo GUEST)

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "name": "Cardápio de Verão",
    "locationId": "uuid",
    "restaurantId": "uuid",
    "isActive": true,
    "displayOrder": 0,
    "createdAt": "2026-04-08T00:00:00.000Z",
    "categories": [
      {
        "id": "uuid",
        "name": "Petiscos",
        "displayOrder": 1,
        "isActive": true,
        "items": [
          {
            "id": "uuid",
            "name": "Batata Frita",
            "description": null,
            "basePrice": 22.9,
            "imageUrl": null,
            "mediaUrls": null,
            "isAvailable": true,
            "displayOrder": 0,
            "modifierGroups": [
              {
                "id": "uuid",
                "name": "Extras",
                "selectionType": "MULTIPLE",
                "isRequired": false,
                "minSelections": 0,
                "maxSelections": 3,
                "options": [
                  {
                    "id": "uuid",
                    "name": "Bacon",
                    "priceDelta": 5.0,
                    "isAvailable": true,
                    "displayOrder": 0
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]
```

> Apenas itens com `isAvailable: true` e categorias com `isActive: true` são retornados.

---

## 6. Mesas & Sessões

### `POST /restaurants/:restaurantId/locations/:locationId/tables`

Cadastra uma mesa na filial. Gera automaticamente o `qrCodeToken`.

**Auth:** OWNER / MANAGER

**Body:**

```json
{
  "label": "Mesa 01",
  "capacity": 4
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "locationId": "uuid",
  "label": "Mesa 01",
  "qrCodeToken": "uuid",
  "capacity": 4,
  "isActive": true
}
```

> O QR Code deve codificar a URL: `https://app.juntai.app/mesa/<qrCodeToken>`

---

### `GET /tables/:qrToken/session`

Rota chamada pelo app do cliente ao escanear o QR. Retorna a sessão aberta ou cria uma nova.

**Auth:** Nenhuma (GUEST)

**Response `200`:**

```json
{
  "id": "uuid",
  "tableId": "uuid",
  "restaurantId": "uuid",
  "locationId": "uuid",
  "status": "OPEN",
  "openedAt": "2026-04-08T20:00:00.000Z",
  "closedAt": null
}
```

---

### `GET /sessions/:sessionId`

Retorna dados de uma sessão.

**Auth:** Staff ou SESSION_USER da sessão

**Response `200`:** mesmo shape acima.

---

### `POST /sessions/:sessionId/join`

Cliente entra na mesa com um nome de exibição e um `clientToken` gerado pelo frontend.

**Auth:** Nenhuma (GUEST)

**Body:**

```json
{
  "displayName": "Pablo",
  "clientToken": "uuid-gerado-pelo-frontend"
}
```

> `clientToken` deve ser um UUID v4 gerado pelo frontend e armazenado localmente (localStorage). Permite re-entering idempotente — se o mesmo `clientToken` já existe na sessão, o usuário é encontrado.

**Response `201`:**

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "displayName": "Pablo",
  "clientToken": "uuid",
  "userId": null,
  "joinedAt": "2026-04-08T20:01:00.000Z",
  "leftAt": null
}
```

> Guarde o `id` retornado como `sessionUserId` para uso nos headers (`X-Session-User-Id`) em todas as próximas requisições.

---

### `DELETE /sessions/:sessionId?restaurantId=<uuid>`

Encerra uma sessão (fecha a conta da mesa).

**Auth:** OWNER / MANAGER / WAITER  
**Header obrigatório:** `X-Restaurant-Id`

**Query:**

```
?restaurantId=<uuid>
```

**Response `204`:** sem body.

---

### `PATCH /session-users/:sessionUserId/link`

Vincula um `SessionUser` (cliente da mesa) a um usuário cadastrado na plataforma.

**Auth:** Staff

**Body:**

```json
{
  "userId": "uuid",
  "clientToken": "uuid"
}
```

**Response `200`:** `SessionUser` com `userId` preenchido.

---

## 7. Pedidos

### `POST /sessions/:sessionId/orders`

Cria um pedido para uma sessão.

**Auth:** SESSION_USER (própria sessão) ou Staff

**Body:**

```json
{
  "sessionUserId": "uuid",
  "notes": "Sem cebola no hambúrguer",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "selectedModifiers": [
        {
          "groupId": "uuid",
          "optionId": "uuid"
        }
      ],
      "notes": "Bem passado"
    }
  ]
}
```

| Campo               | Notas                          |
| ------------------- | ------------------------------ |
| `items`             | mínimo 1 item                  |
| `selectedModifiers` | array vazio `[]` se não houver |
| `quantity`          | int positivo, default `1`      |

**Response `201`:**

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "sessionUserId": "uuid",
  "restaurantId": "uuid",
  "locationId": "uuid",
  "status": "PENDING",
  "notes": null,
  "createdAt": "2026-04-08T20:05:00.000Z",
  "updatedAt": "2026-04-08T20:05:00.000Z",
  "items": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "menuItemId": "uuid",
      "quantity": 2,
      "unitPrice": 27.9,
      "notes": "Bem passado",
      "snapshot": {
        "menuItemId": "uuid",
        "name": "Batata Frita Crocante",
        "description": null,
        "basePrice": 22.9,
        "modifiers": [
          {
            "groupId": "uuid",
            "groupName": "Extras",
            "optionId": "uuid",
            "optionName": "Bacon",
            "priceDelta": 5.0
          }
        ]
      }
    }
  ]
}
```

> O `snapshot` é imutável — mesmo que o preço do cardápio mude depois, o pedido preserva os valores no momento da criação.

---

### `PUT /orders/:orderId/status`

Atualiza o status de um pedido (fluxo da cozinha).

**Auth:** OWNER / MANAGER / WAITER (do mesmo restaurante)

**Transições válidas:**

```
PENDING → PREPARING → DELIVERED
PENDING → CANCELLED
PREPARING → CANCELLED
```

**Body:**

```json
{
  "restaurantId": "uuid",
  "status": "PREPARING"
}
```

**Response `200`:** `Order` atualizado.

---

### `GET /sessions/:sessionId/orders`

Lista todos os pedidos de uma sessão.

**Auth:** SESSION_USER (própria sessão) ou Staff

**Response `200`:** array de `Order` com `items`.

---

### `GET /restaurants/:restaurantId/orders`

Lista pedidos do restaurante com suporte a filtro e paginação. Rota do painel da cozinha/console.

**Auth:** OWNER / MANAGER / WAITER

**Query params:**
| Param | Tipo | Default | Notas |
|-------|------|---------|-------|
| `status` | `PENDING` \| `PREPARING` \| `DELIVERED` \| `CANCELLED` | — | opcional |
| `page` | int positivo | `1` | |
| `limit` | int 1–100 | `20` | |

**Exemplo:** `GET /restaurants/<id>/orders?status=PENDING&page=1&limit=10`

**Response `200`:**

```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## 8. Pagamentos

### `GET /sessions/:sessionId/bill`

Retorna a conta da sessão — total gasto, quanto já foi pago e quanto resta por item.

**Auth:** SESSION_USER (própria sessão) ou Staff

**Response `200`:**

```json
{
  "sessionId": "uuid",
  "totalAmount": 89.7,
  "paidAmount": 44.85,
  "remainingAmount": 44.85,
  "items": [
    {
      "orderItemId": "uuid",
      "name": "Batata Frita Crocante",
      "unitPrice": 22.9,
      "quantity": 2,
      "totalPrice": 45.8,
      "paidPortion": 0.5,
      "paidAmount": 22.9,
      "remaining": 22.9
    }
  ]
}
```

---

### `POST /sessions/:sessionId/payments`

Registra um pagamento parcial ou total da conta. Suporta **divisão de conta** via `portion`.

**Auth:** SESSION_USER (própria sessão) ou Staff

**Body:**

```json
{
  "sessionUserId": "uuid",
  "method": "PIX",
  "items": [
    {
      "orderItemId": "uuid",
      "portion": 0.5
    }
  ]
}
```

| Campo             | Tipo                            | Notas                                          |
| ----------------- | ------------------------------- | ---------------------------------------------- |
| `method`          | `"CASH"` \| `"CARD"` \| `"PIX"` |                                                |
| `items[].portion` | number (0–1]                    | `1.0` = paga 100% do item; `0.5` = paga metade |

**Response `201`:**

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "sessionUserId": "uuid",
  "restaurantId": "uuid",
  "locationId": "uuid",
  "amount": 22.9,
  "status": "COMPLETED",
  "method": "PIX",
  "createdAt": "2026-04-08T21:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "paymentId": "uuid",
      "orderItemId": "uuid",
      "portion": 0.5,
      "amount": 22.9
    }
  ]
}
```

> Quando `paidAmount >= totalAmount` na sessão, a sessão é **fechada automaticamente**.

---

## 9. Realtime (WebSocket)

A API usa WebSocket puro (sem Socket.io). Conecte-se com qualquer cliente WS padrão.

### `WS /ws/session/:sessionId`

Canal da mesa. Usado pela interface do cliente (app do garçom, app do convidado).

**Auth:** Não requerida na conexão (auth via protocolo WS ou header futuro).

**Heartbeat:** envie `"ping"` → recebe `"pong"` para manter a conexão viva.

### `WS /ws/location/:locationId`

Canal da filial. Usado pelo painel da cozinha e pelo Juntai Console.

---

### Formato das mensagens

Todas as mensagens são JSON:

```typescript
{ "type": string, "payload": object }
```

| `type`                 | Payload                               | Enviado para         |
| ---------------------- | ------------------------------------- | -------------------- |
| `USER_JOINED`          | `{ sessionUserId: string }`           | sessão + localização |
| `ORDER_CREATED`        | `{ orderId: string }`                 | sessão + localização |
| `ORDER_STATUS_CHANGED` | `{ orderId: string, status: string }` | sessão + localização |
| `PAYMENT_COMPLETED`    | `{ amount: number }`                  | sessão + localização |
| `SESSION_CLOSED`       | `{}`                                  | sessão + localização |

**Exemplo de cliente:**

```typescript
const ws = new WebSocket(`wss://api.juntai.app/ws/location/${locationId}`);

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);

  if (type === "ORDER_CREATED") {
    // buscar o pedido via GET /restaurants/:id/orders?status=PENDING
    refreshOrders();
  }

  if (type === "SESSION_CLOSED") {
    // atualizar estado local
  }
};

// heartbeat
setInterval(() => ws.send("ping"), 30_000);
```

---

## 10. Mapa de Permissões

| Rota                              | GUEST | SESSION_USER | WAITER | MANAGER | OWNER |
| --------------------------------- | :---: | :----------: | :----: | :-----: | :---: |
| `POST /users`                     |  ✅   |      ✅      |   ✅   |   ✅    |  ✅   |
| `GET /users/:id`                  |  ❌   |      ❌      |   ✅   |   ✅    |  ✅   |
| `POST /users/:id/staff-tokens`    |  ❌   |      ❌      |   ❌   |   ❌    |  ✅   |
| `POST /users/:id/location-roles`  |  ❌   |      ❌      |   ❌   |   ❌    |  ✅   |
| `POST /restaurants`               |  ❌   |      ❌      |   ❌   |   ❌    |  ✅   |
| `GET /restaurants/:id`            |  ❌   |      ❌      |   ✅   |   ✅    |  ✅   |
| `POST /restaurants/:id/locations` |  ❌   |      ❌      |   ❌   |   ❌    |  ✅   |
| `GET /restaurants/:id/locations`  |  ❌   |      ❌      |   ✅   |   ✅    |  ✅   |
| `POST .../menus`                  |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `POST .../categories`             |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `PATCH /categories/:id`           |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `DELETE /categories/:id`          |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `POST .../items`                  |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `PATCH /items/:id`                |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `DELETE /items/:id`               |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `GET .../menu`                    |  ✅   |      ✅      |   ✅   |   ✅    |  ✅   |
| `POST .../tables`                 |  ❌   |      ❌      |   ❌   |   ✅    |  ✅   |
| `GET /tables/:qrToken/session`    |  ✅   |      ✅      |   ✅   |   ✅    |  ✅   |
| `POST /sessions/:id/join`         |  ✅   |      ✅      |   ✅   |   ✅    |  ✅   |
| `GET /sessions/:id`               |  ❌   | ✅ (própria) |   ✅   |   ✅    |  ✅   |
| `DELETE /sessions/:id`            |  ❌   |      ❌      |   ✅   |   ✅    |  ✅   |
| `POST /sessions/:id/orders`       |  ❌   | ✅ (própria) |   ✅   |   ✅    |  ✅   |
| `GET /sessions/:id/orders`        |  ❌   | ✅ (própria) |   ✅   |   ✅    |  ✅   |
| `PUT /orders/:id/status`          |  ❌   |      ❌      |   ✅   |   ✅    |  ✅   |
| `GET /restaurants/:id/orders`     |  ❌   |      ❌      |   ✅   |   ✅    |  ✅   |
| `GET /sessions/:id/bill`          |  ❌   | ✅ (própria) |   ✅   |   ✅    |  ✅   |
| `POST /sessions/:id/payments`     |  ❌   | ✅ (própria) |   ✅   |   ✅    |  ✅   |

---

## 11. Fluxos de Uso — Juntai Console

### Fluxo A — Cadastro de restaurante parceiro (admin Juntai)

```
1. POST /users           → cria o dono do restaurante (globalRole: "OWNER")
2. POST /restaurants     → cria o restaurante
3. POST /restaurants/:id/locations  → cria a(s) filial(is)
4. POST /users/:id/staff-tokens     → gera token para o OWNER (guardar!)
5. POST /users (STAFF) + POST /users/:id/location-roles  → cria garçons/managers
```

---

### Fluxo B — Montagem do cardápio (portal do restaurante)

```
1. POST /restaurants/:id/menus                      → cria o menu
2. POST /menus/:id/categories                       → cria categorias
3. POST /categories/:id/items                       → cria itens
4. POST /restaurants/:id/modifier-groups            → cria grupos de modificadores
5. POST /modifier-groups/:id/options                → adiciona opções
6. POST /items/:id/modifier-groups/:id              → vincula modificadores ao item
7. PATCH /items/:id                                 → atualiza preço/disponibilidade
8. DELETE /categories/:id  ou  DELETE /items/:id    → remove itens/categorias
```

---

### Fluxo C — Cliente na mesa (app do convidado)

```
1. GET /tables/:qrToken/session        → abre ou retoma sessão
2. POST /sessions/:id/join             → entra com displayName e clientToken
   → salvar sessionUserId no localStorage
   → conectar WS: /ws/session/:sessionId
3. GET /restaurants/:id/locations/:id/menu  → exibe o cardápio
4. POST /sessions/:id/orders           → faz pedido
   → header: X-Session-User-Id: <sessionUserId>
5. GET /sessions/:id/bill              → visualiza conta
6. POST /sessions/:id/payments         → paga (parte ou total)
```

---

### Fluxo D — Cozinha / Painel da filial (Juntai Console)

```
1. Conectar WS: /ws/location/:locationId
   → ouvir ORDER_CREATED para novos pedidos
   → ouvir ORDER_STATUS_CHANGED para atualizações
2. GET /restaurants/:id/orders?status=PENDING&page=1  → lista pedidos na fila
3. PUT /orders/:id/status  { status: "PREPARING" }    → aceita pedido
4. PUT /orders/:id/status  { status: "DELIVERED" }    → marca como entregue
5. DELETE /sessions/:id?restaurantId=<id>             → fecha a mesa
```

---

### Fluxo E — Autenticação de staff no console

```typescript
// 1. O token foi gerado em POST /users/:id/staff-tokens e armazenado
const token = localStorage.getItem("juntai_staff_token");
const restaurantId = localStorage.getItem("juntai_restaurant_id");
const locationId = localStorage.getItem("juntai_location_id");

// 2. Adicionar em toda requisição autenticada
const headers = {
  Authorization: `Bearer ${token}`,
  "X-Restaurant-Id": restaurantId,
  "X-Location-Id": locationId,
  "Content-Type": "application/json",
};

// 3. Conectar ao WebSocket da filial
const ws = new WebSocket(`wss://api.juntai.app/ws/location/${locationId}`);
```
