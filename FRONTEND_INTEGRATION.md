# Juntai — Frontend Integration Guide

> **Audience:** Frontend developers and AI agents building UI on top of the Juntai Hermes API.  
> **Base URL:** `http://localhost:3000` (dev) — configure via env var `API_BASE_URL`  
> **API Style:** REST + JSON + WebSocket  
> **Auth:** Bearer token (JWT-format UUID, never the hash)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Context Headers](#2-context-headers)
3. [Actor Roles & Permissions](#3-actor-roles--permissions)
4. [Routes Reference](#4-routes-reference)
   - [Auth](#41-auth)
   - [Users](#42-users)
   - [Restaurants](#43-restaurants)
   - [Locations](#44-locations)
   - [Menus & Catalog](#45-menus--catalog)
   - [Tables](#46-tables)
   - [Sessions](#47-sessions)
   - [Orders](#48-orders)
   - [Payments & Bill](#49-payments--bill)
   - [Memberships](#410-memberships)
5. [WebSocket / Realtime](#5-websocket--realtime)
6. [Data Types](#6-data-types)
7. [Error Handling](#7-error-handling)
8. [Business Rules](#8-business-rules)
9. [Validation Constraints](#9-validation-constraints)
10. [Frontend Flows](#10-frontend-flows)

---

## 1. Authentication

### 1.1 Magic Link (Staff / Registered Users)

```
POST /auth/magic-link   → sends 6-digit code to email (15 min TTL)
POST /auth/verify       → exchanges code for token
```

Store the returned `token` and send it as:
```
Authorization: Bearer <token>
```

Token validity: **30 days**. Invalidate with `DELETE /auth/session`.

### 1.2 Guest Session (Customer via QR Code)

```
POST /auth/guest   → creates guest user + token
```

Same `Authorization: Bearer <token>` flow. Token validity: **30 days**.

### 1.3 Current User

```
GET /auth/me   → { user, memberships[] }
```

Requires: `Authorization: Bearer <token>` (non-guest)

---

## 2. Context Headers

Role resolution depends on extra headers beyond the Bearer token:

| Header | Type | Purpose |
|---|---|---|
| `Authorization` | `Bearer <token>` | Identifies the user |
| `x-restaurant-id` | UUID | Scopes staff to a restaurant |
| `x-location-id` | UUID | Scopes staff to a location |
| `x-table-session-id` | UUID | Identifies active table session (customers) |

**Rule:** The system reads these headers in order to resolve the actor's final role. Send all applicable headers on every request.

---

## 3. Actor Roles & Permissions

| Role | How obtained | Access level |
|---|---|---|
| `GUEST` | No token | Only public GET routes and POST /auth/guest |
| `AUTHENTICATED` | Valid token, no extra headers | GET /auth/me, POST /users, GET /users |
| `SESSION_USER` | Token + `x-table-session-id` | Create orders, view bill, pay, join session |
| `WAITER` | Token + `x-restaurant-id` + `x-location-id` + waiter membership | All session/order ops |
| `MANAGER` | Same + manager membership | All waiter ops + menu management |
| `OWNER` | Token + `x-restaurant-id` + owner membership | All manager ops + location management |
| `PLATFORM_ADMIN` | Token + platform admin membership | Full access |

---

## 4. Routes Reference

### 4.1 Auth

#### `POST /auth/guest`
Create a guest session (called when customer scans QR code).

- **Auth:** None
- **Body:** `{}`
- **Response `200`:**
```json
{
  "token": "uuid-v4",
  "user": {
    "id": "uuid",
    "type": "guest",
    "name": null,
    "email": null,
    "createdAt": "ISO8601"
  }
}
```

---

#### `POST /auth/magic-link`
Request a 6-digit login code via email.

- **Auth:** None
- **Body:**
```json
{ "email": "user@example.com" }
```
- **Response `202`:** Empty body (email sent asynchronously)

---

#### `POST /auth/verify`
Exchange code for a token.

- **Auth:** None
- **Body:**
```json
{ "email": "user@example.com", "code": "123456" }
```
- **Response `200`:**
```json
{
  "token": "uuid-v4",
  "user": { "id": "uuid", "type": "user", "name": "...", "email": "...", "createdAt": "ISO8601" }
}
```

---

#### `GET /auth/me`
Fetch current user and their memberships.

- **Auth:** Bearer (non-guest)
- **Response `200`:**
```json
{
  "user": { "id": "uuid", "type": "user", "name": "...", "email": "...", "createdAt": "ISO8601" },
  "memberships": [
    { "id": "uuid", "userId": "uuid", "entityType": "restaurant", "entityId": "uuid", "role": "manager" }
  ]
}
```

---

#### `DELETE /auth/session`
Logout — invalidates current token.

- **Auth:** Bearer
- **Response `204`:** No content

---

### 4.2 Users

#### `GET /users`
List users (scope depends on actor role).

- **Auth:** OWNER+ or MANAGER+
- **Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `name` | string | — | partial match |
| `email` | string | — | partial match |
| `role` | `"admin"\|"owner"\|"manager"\|"waiter"` | — | filter by role |
| `page` | int | `1` | min 1 |
| `limit` | int | `20` | 1–100 |

- **Response `200`:**
```json
{ "users": [ User ], "total": 42, "page": 1 }
```

---

#### `POST /users`
Create a new user.

- **Auth:** AUTHENTICATED+
- **Body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com" }
```
Both fields are optional but at least one is expected.

- **Response `201`:** `User`

---

#### `GET /users/:userId`
Get user by ID.

- **Auth:** Bearer
- **Response `200`:** `User`

---

### 4.3 Restaurants

#### `GET /restaurants`
List all restaurants.

- **Auth:** None
- **Response `200`:** `Restaurant[]`

---

#### `POST /restaurants`
Create a restaurant.

- **Auth:** PLATFORM_ADMIN
- **Body:**
```json
{
  "name": "Meu Restaurante",
  "slug": "meu-restaurante",
  "logoUrl": "https://...",
  "coverUrl": "https://...",
  "settings": {
    "type": "BAR",
    "allowAnonymous": true,
    "requireApproval": false,
    "currency": "BRL"
  }
}
```

`slug`: lowercase letters, digits, hyphens only — must be unique globally.  
`settings.type`: `"BAR" | "RESTAURANT" | "RODIZIO" | "CAFETERIA" | "EVENT"`

- **Response `201`:** `Restaurant`

---

#### `GET /restaurants/:restaurantId`
Get a restaurant by ID.

- **Auth:** None
- **Response `200`:** `Restaurant`

---

### 4.4 Locations

#### `POST /restaurants/:restaurantId/locations`
Create a branch/location.

- **Auth:** OWNER+ (with `x-restaurant-id`)
- **Body:**
```json
{
  "name": "Unidade Centro",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Sala 2",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "postalCode": "01001000",
    "country": "BR",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "phone": "+5511999999999",
  "logoUrl": "https://..."
}
```

`state`: exactly 2 characters. `country`: exactly 2 characters (default `"BR"`).

- **Response `201`:** `Location`

---

#### `GET /restaurants/:restaurantId/locations`
List locations for a restaurant.

- **Auth:** OWNER+ (with `x-restaurant-id`)
- **Response `200`:** `Location[]`

---

#### `GET /restaurants/:restaurantId/locations/:locationId`
Get a specific location.

- **Auth:** OWNER+
- **Response `200`:** `Location`

---

### 4.5 Menus & Catalog

#### `GET /restaurants/:restaurantId/locations/:locationId/menu`
Fetch the full menu for a location. **Main catalog endpoint for customers.**

- **Auth:** None (public)
- **Response `200`:**
```json
{
  "categories": [ Category ],
  "items": [ MenuItem ],
  "modifiers": [ ModifierGroup ]
}
```

---

#### `POST /restaurants/:restaurantId/menus`
Create a menu.

- **Auth:** MANAGER+ (with `x-restaurant-id` + `x-location-id`)
- **Body:**
```json
{
  "name": "Cardápio Principal",
  "locationId": "uuid-or-null",
  "displayOrder": 0
}
```

`locationId = null` → menu shared across all branches.

- **Response `201`:** `Menu`

---

#### `POST /menus/:menuId/categories`
Create a category inside a menu.

- **Auth:** MANAGER+
- **Body:**
```json
{ "restaurantId": "uuid", "name": "Bebidas", "displayOrder": 0 }
```
- **Response `201`:** `Category`

---

#### `PATCH /categories/:categoryId`
Update a category.

- **Auth:** MANAGER+
- **Body:**
```json
{ "restaurantId": "uuid", "name": "Bebidas Frias", "isActive": true, "displayOrder": 1 }
```
All fields except `restaurantId` are optional.

- **Response `200`:** `Category`

---

#### `DELETE /categories/:categoryId`
Delete a category (and its items).

- **Auth:** MANAGER+
- **Body:** `{ "restaurantId": "uuid" }`
- **Response `204`:** No content

---

#### `POST /categories/:categoryId/items`
Create a menu item.

- **Auth:** MANAGER+
- **Body:**
```json
{
  "restaurantId": "uuid",
  "name": "Pizza Margherita",
  "description": "Molho, mussarela, manjericão",
  "type": "simple",
  "basePrice": 49.90,
  "imageUrl": "https://...",
  "mediaUrls": ["https://..."],
  "displayOrder": 0
}
```

`type`: `"simple"` — fixed price item; `"composable"` — price built from modifier steps.

- **Response `201`:** `MenuItem`

---

#### `PATCH /items/:itemId`
Update a menu item.

- **Auth:** MANAGER+
- **Body:**
```json
{
  "restaurantId": "uuid",
  "name": "...",
  "description": "...",
  "basePrice": 55.00,
  "isAvailable": false,
  "displayOrder": 2
}
```
All fields except `restaurantId` are optional.

- **Response `200`:** `MenuItem`

---

#### `DELETE /items/:itemId`
Delete a menu item.

- **Auth:** MANAGER+
- **Body:** `{ "restaurantId": "uuid" }`
- **Response `204`:** No content

---

#### `POST /restaurants/:restaurantId/modifier-groups`
Create a modifier group (customization engine).

- **Auth:** MANAGER+
- **Body:**
```json
{
  "name": "Tamanho",
  "selectionType": "SINGLE",
  "stepType": "choice",
  "pricingStrategy": "sum",
  "compositionConfig": null,
  "isRequired": true,
  "minSelections": 1,
  "maxSelections": 1
}
```

| Field | Values | Meaning |
|---|---|---|
| `selectionType` | `"SINGLE"\|"MULTIPLE"` | How many options customer can pick |
| `stepType` | `"choice"\|"multi"\|"composition"\|"quantity"` | Rendering/pricing mode |
| `pricingStrategy` | `"sum"\|"max"\|"average"` | How selected options affect price |
| `compositionConfig` | `{ maxParts: int }` or `null` | Only for `stepType="composition"` |

- **Response `201`:** `ModifierGroup`

---

#### `POST /modifier-groups/:groupId/options`
Add an option to a modifier group.

- **Auth:** MANAGER+
- **Body:**
```json
{
  "restaurantId": "uuid",
  "name": "Grande",
  "parentOptionId": null,
  "priceDelta": 10.00,
  "displayOrder": 0,
  "minQuantity": 0,
  "maxQuantity": 1,
  "unitPrice": null
}
```

`parentOptionId`: set to another option's UUID to create nested choices.  
`priceDelta`: positive (extra cost) or negative (discount).  
`unitPrice`: used when `stepType="quantity"` for per-unit pricing.

- **Response `201`:** `ModifierOption`

---

#### `POST /items/:itemId/modifier-groups/:groupId`
Attach a modifier group to a menu item.

- **Auth:** MANAGER+
- **Body:** `{ "restaurantId": "uuid" }`
- **Response `204`:** No content

---

### 4.6 Tables

#### `GET /restaurants/:restaurantId/locations/:locationId/tables`
List all tables for a location.

- **Auth:** MANAGER+ (with `x-restaurant-id` + `x-location-id`)
- **Response `200`:** `Table[]`

---

#### `POST /restaurants/:restaurantId/locations/:locationId/tables`
Create a table.

- **Auth:** MANAGER+
- **Body:**
```json
{ "label": "Mesa 01", "capacity": 4 }
```
- **Response `201`:** `Table` (includes `qrCodeToken`)

---

#### `GET /tables/:qrToken/session`
Scan QR code → get or create an open session.

- **Auth:** Bearer (GUEST or authenticated)
- **Response `200`:** `TableSession`

---

### 4.7 Sessions

#### `GET /sessions/:sessionId`
Get session details (members, orders, payments).

- **Auth:** SESSION_USER or WAITER+
- **Headers:** `x-table-session-id: <sessionId>`
- **Response `200`:** `TableSession`

---

#### `POST /sessions/:sessionId/join`
Add current user to a session.

- **Auth:** Non-guest Bearer
- **Body:**
```json
{ "displayName": "João" }
```
- **Response `201`:** `TableSessionMember`

---

#### `DELETE /sessions/:sessionId`
Close a session (checkout).

- **Auth:** WAITER+
- **Query:** `?restaurantId=<uuid>`
- **Response `204`:** No content

---

### 4.8 Orders

#### `POST /sessions/:sessionId/orders`
Place an order.

- **Auth:** SESSION_USER or WAITER+
- **Headers:** `x-table-session-id: <sessionId>` (for SESSION_USER)
- **Body:**
```json
{
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "selectedModifiers": [
        {
          "groupId": "uuid",
          "optionId": "uuid",
          "quantity": 1,
          "childSelections": [
            { "groupId": "uuid", "optionId": "uuid" }
          ]
        }
      ],
      "notes": "Sem cebola"
    }
  ],
  "notes": "Urgente"
}
```

`selectedModifiers` is **always required** even when empty (`[]`). Use `quantity` only for `stepType="quantity"` groups. Use `childSelections` for nested modifiers.

- **Response `201`:** `Order`

---

#### `GET /sessions/:sessionId/orders`
List orders in a session.

- **Auth:** SESSION_USER or WAITER+
- **Response `200`:** `Order[]`

---

#### `GET /restaurants/:restaurantId/orders`
List all orders for a restaurant (kitchen/management view).

- **Auth:** MANAGER+
- **Query params:**

| Param | Type | Default |
|---|---|---|
| `status` | `"PENDING"\|"PREPARING"\|"DELIVERED"\|"CANCELLED"` | — |
| `page` | int | `1` |
| `limit` | int | `20` (max 100) |

- **Response `200`:**
```json
{ "orders": [ Order ], "total": 10, "page": 1 }
```

---

#### `PUT /orders/:orderId/status`
Update order status (kitchen/waiter workflow).

- **Auth:** WAITER+ (with `x-restaurant-id`)
- **Body:**
```json
{ "restaurantId": "uuid", "status": "PREPARING" }
```

Valid transitions: `PENDING → PREPARING → DELIVERED` | any → `CANCELLED`

- **Response `200`:** `Order`

---

### 4.9 Payments & Bill

#### `GET /sessions/:sessionId/bill`
Calculate current bill for the session.

- **Auth:** SESSION_USER or WAITER+
- **Response `200`:**
```json
{
  "items": [
    {
      "orderItemId": "uuid",
      "name": "Pizza Margherita",
      "quantity": 2,
      "unitPrice": 49.90,
      "total": 99.80
    }
  ],
  "subtotal": 99.80,
  "tax": null,
  "total": 99.80
}
```

---

#### `POST /sessions/:sessionId/payments`
Create a payment (supports partial/split payments).

- **Auth:** SESSION_USER or WAITER+
- **Body:**
```json
{
  "method": "PIX",
  "items": [
    { "orderItemId": "uuid", "portion": 1.0 },
    { "orderItemId": "uuid", "portion": 0.5 }
  ]
}
```

`method`: `"CASH" | "CARD" | "PIX"`  
`portion`: `0.0 < portion ≤ 1.0` — fraction of the item to pay (1.0 = 100%, 0.5 = split half)

- **Response `201`:** `Payment`

---

### 4.10 Memberships

#### `POST /memberships`
Assign a role to a user.

- **Auth:** PLATFORM_ADMIN
- **Body:**
```json
{
  "userId": "uuid",
  "entityType": "location",
  "entityId": "uuid",
  "role": "manager"
}
```

`entityType`: `"platform" | "restaurant" | "location"`  
`role`: `"admin" | "owner" | "manager" | "waiter"`

- **Response `201`:** `Membership`

---

#### `DELETE /memberships/:membershipId`
Remove a role assignment.

- **Auth:** PLATFORM_ADMIN
- **Response `204`:** No content

---

## 5. WebSocket / Realtime

### 5.1 Connecting

**Customer (session events):**
```
GET /ws/session/:sessionId
Authorization: Bearer <token>
x-table-session-id: <sessionId>
```

**Staff (location events):**
```
GET /ws/location/:locationId
Authorization: Bearer <token>
x-restaurant-id: <restaurantId>
x-location-id: <locationId>
```

### 5.2 Heartbeat

Send periodically to keep connection alive:
```json
{ "type": "ping" }
```
Server responds:
```json
{ "type": "pong" }
```

### 5.3 Incoming Events

All events follow the envelope:
```json
{ "type": "EVENT_TYPE", "payload": { ... } }
```

| Event type | Broadcast to | Payload |
|---|---|---|
| `USER_JOINED` | Session + Location | `{ sessionId, memberId, restaurantId, locationId }` |
| `ORDER_CREATED` | Session + Location | `{ orderId, sessionId, restaurantId, locationId }` |
| `ORDER_STATUS_CHANGED` | Session + Location | `{ orderId, status, sessionId, restaurantId, locationId }` |
| `PAYMENT_COMPLETED` | Session + Location | `{ paymentId, sessionId, restaurantId, locationId, amount }` |
| `SESSION_CLOSED` | Session + Location | `{ sessionId, restaurantId, locationId }` |

**Recommended pattern:** on `ORDER_CREATED` or `ORDER_STATUS_CHANGED`, refetch `GET /sessions/:sessionId/orders` for updated data.

---

## 6. Data Types

### `User`
```typescript
{
  id: string;           // UUID
  type: "guest" | "user";
  name: string | null;
  email: string | null;
  createdAt: string;    // ISO 8601
}
```

### `Membership`
```typescript
{
  id: string;
  userId: string;
  entityType: "platform" | "restaurant" | "location";
  entityId: string;
  role: "admin" | "owner" | "manager" | "waiter";
}
```

### `Restaurant`
```typescript
{
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  settings: {
    type: "BAR" | "RESTAURANT" | "RODIZIO" | "CAFETERIA" | "EVENT";
    allowAnonymous: boolean;
    requireApproval: boolean;
    currency: string;  // e.g. "BRL"
  };
  createdAt: string;
}
```

### `Location`
```typescript
{
  id: string;
  restaurantId: string;
  name: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;     // 2 chars
    postalCode: string;
    country: string;   // 2 chars
    lat?: number;
    lng?: number;
  };
  phone?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
}
```

### `MenuItem`
```typescript
{
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description?: string;
  type: "simple" | "composable";
  basePrice: number;
  imageUrl?: string;
  mediaUrls?: string[];
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
}
```

### `ModifierGroup`
```typescript
{
  id: string;
  restaurantId: string;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  stepType: "choice" | "multi" | "composition" | "quantity";
  pricingStrategy?: "sum" | "max" | "average";
  compositionConfig?: { maxParts: number };
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number;
}
```

### `ModifierOption`
```typescript
{
  id: string;
  modifierGroupId: string;
  parentOptionId?: string;  // for nested options
  name: string;
  priceDelta: number;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice?: number;       // for quantity-based steps
  isAvailable: boolean;
  displayOrder: number;
}
```

### `Table`
```typescript
{
  id: string;
  restaurantId: string;
  locationId: string;
  label: string;
  qrCodeToken: string;
  capacity?: number;
  isActive: boolean;
}
```

### `TableSession`
```typescript
{
  id: string;
  tableId: string;
  restaurantId: string;
  locationId: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
  members: TableSessionMember[];
  orders: Order[];
  payments: Payment[];
}
```

### `TableSessionMember`
```typescript
{
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
  leftAt?: string;
}
```

### `Order`
```typescript
{
  id: string;
  sessionId: string;
  memberId?: string;          // null if placed by staff
  restaurantId: string;
  locationId: string;
  status: "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
```

### `OrderItem`
```typescript
{
  id: string;
  orderId: string;
  menuItemId?: string;        // reference (may be stale if item deleted)
  quantity: number;
  unitPrice: number;
  notes?: string;
  snapshot: OrderItemSnapshot; // ALWAYS use snapshot for display
}
```

### `OrderItemSnapshot`
> Use this for displaying name, price, and modifiers — never the live menu item.

```typescript
{
  menuItemId: string;
  name: string;
  description: string | null;
  basePrice: number;
  // For simple items:
  modifiers: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceDelta: number;
  }[];
  // For composable items:
  steps?: {
    groupId: string;
    groupName: string;
    stepType: string;
    pricingStrategy: string;
    selections: {
      optionId: string;
      optionName: string;
      priceDelta: number;
      quantity?: number;
      lineTotal?: number;
      childSelections?: object[];
    }[];
    stepPrice: number;
  }[];
  finalPrice: number;
}
```

### `Payment`
```typescript
{
  id: string;
  sessionId: string;
  memberId?: string;
  restaurantId: string;
  locationId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: "CASH" | "CARD" | "PIX";
  createdAt: string;
  items: {
    id: string;
    paymentId: string;
    orderItemId: string;
    portion: number;   // 0.0 – 1.0
    amount: number;
  }[];
}
```

---

## 7. Error Handling

All errors return JSON:
```json
{ "code": "ERROR_CODE", "message": "Human-readable message" }
```

Validation errors include field details:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dados de entrada inválidos",
  "details": [
    { "field": "items.0.quantity", "message": "must be a positive integer" }
  ]
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body/params |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `EMAIL_ALREADY_IN_USE` | 409 | Duplicate email |
| `SLUG_ALREADY_IN_USE` | 409 | Duplicate restaurant slug |
| `SESSION_CLOSED` | 422 | Attempted action on closed session |
| `OVERPAYMENT` | 422 | Payment amount exceeds bill |

**Recommended handling:**
- `400` → show field-level errors from `details`
- `403` → redirect to login or show permission denied
- `409` → show uniqueness feedback in forms
- `422` → show business rule violation message
- `5xx` → show generic error, retry once

---

## 8. Business Rules

### Orders
- Orders can only be placed in `OPEN` sessions.
- `selectedModifiers` must satisfy `isRequired`, `minSelections`, and `maxSelections` of each attached modifier group.
- Item prices are frozen in `snapshot` at the moment of ordering — changes to the menu never affect past orders.
- Staff (WAITER+) can place orders without `x-table-session-id`.

### Payments
- `portion` values per `orderItemId` across all payments must not exceed `1.0` total.
- A session can have multiple payments (split bill, partial payments).
- Once a session is `CLOSED`, no new orders or payments are accepted.

### Menu
- A `MenuItem` with `type="composable"` has its final price derived entirely from modifier steps (`pricingStrategy`). Its `basePrice` may be 0.
- A menu with `locationId = null` is shared across all branches of the restaurant.
- Deleting a category deletes all its items.

### Sessions
- Scanning a QR code (`GET /tables/:qrToken/session`) opens a new session if the table has no open session.
- Only WAITER+ can close a session.
- Joining a session (`POST /sessions/:sessionId/join`) requires a valid non-guest token.

### Multi-tenancy
- Every entity (order, payment, table, menu item, etc.) is always scoped to a `restaurantId`.
- Location-level entities (tables, sessions, orders, payments) are also scoped to `locationId`.
- Staff must always send `x-restaurant-id` (and `x-location-id` for location-level ops).

---

## 9. Validation Constraints

| Field | Rule |
|---|---|
| `email` | Valid email format |
| `code` (magic link) | Exactly 6 characters |
| `slug` | Lowercase, digits, hyphens only (`/^[a-z0-9-]+$/`) — unique globally |
| `name` (all entities) | Min 1, max 100–200 chars depending on entity |
| `state` | Exactly 2 characters (e.g. `"SP"`) |
| `country` | Exactly 2 characters (default `"BR"`) |
| `basePrice` | Positive number |
| `priceDelta` | Any number (negative = discount) |
| `portion` | `0 < portion ≤ 1.0` |
| `quantity` (order item) | Positive integer |
| `displayOrder` | Integer (can be negative) |
| `page` | Integer ≥ 1 |
| `limit` | Integer 1–100 |
| All `*Id` path params | Valid UUID v4 |

---

## 10. Frontend Flows

### Customer Flow (QR Code → Order → Pay)

```
1. Scan QR code
   → POST /auth/guest                         (get token)
   → GET /tables/:qrToken/session             (get/open session)

2. Browse menu
   → GET /restaurants/:id/locations/:id/menu  (catalog)

3. Join session (optional, for personalization)
   → POST /sessions/:sessionId/join           (displayName)

4. Place order
   → POST /sessions/:sessionId/orders         (items + modifiers)

5. Monitor status (realtime)
   → WS  /ws/session/:sessionId
   → listen for ORDER_STATUS_CHANGED

6. Request bill
   → GET /sessions/:sessionId/bill

7. Pay
   → POST /sessions/:sessionId/payments
```

---

### Staff Flow (Waiter — Kitchen View)

```
1. Login
   → POST /auth/magic-link                    (email)
   → POST /auth/verify                        (code)

2. Subscribe to location events
   → WS  /ws/location/:locationId
   → listen for ORDER_CREATED, PAYMENT_COMPLETED

3. View incoming orders
   → GET /restaurants/:id/orders?status=PENDING

4. Update order status
   → PUT /orders/:orderId/status              { status: "PREPARING" }
   → PUT /orders/:orderId/status              { status: "DELIVERED" }

5. Close session (checkout)
   → DELETE /sessions/:sessionId
```

---

### Manager Flow (Menu Management)

```
1. Create/update items
   → POST /categories/:id/items
   → PATCH /items/:itemId                     { isAvailable: false }

2. Create modifier groups
   → POST /restaurants/:id/modifier-groups
   → POST /modifier-groups/:id/options
   → POST /items/:id/modifier-groups/:groupId

3. Monitor operations
   → WS  /ws/location/:locationId
   → GET /restaurants/:id/orders
```

---

*Last updated: auto-generated from Juntai Hermes source — see `src/modules/` for authoritative schemas.*
