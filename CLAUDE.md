@AGENTS.md

# Juntai Athenas — Claude Instructions

## Contexto do Projeto

Frontend Next.js do sistema Juntai. Consome a API REST do **Juntai Hermes** (`juntai-hermes/`).  
Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Vitest.  
Ver `API_REFERENCE.md` para contrato completo da API.

---

## Como consumir a API Hermes

### Base URLs

- Dev: `http://localhost:3000`
- Prod: `https://api.juntai.app`

### Autenticação — Staff (OWNER / MANAGER / WAITER)

Todo fetch autenticado de staff deve incluir os três headers:

```typescript
const headers = {
  Authorization: `Bearer ${token}`, // rawToken de POST /users/:id/staff-tokens
  "X-Restaurant-Id": restaurantId,
  "X-Location-Id": locationId,
  "Content-Type": "application/json",
};
```

O token é armazenado após geração em `POST /users/:id/staff-tokens` — é exibido **uma única vez**.

### Autenticação — Cliente de mesa (SESSION_USER)

```typescript
const headers = {
  "X-Session-User-Id": sessionUserId, // id retornado por POST /sessions/:id/join
  "Content-Type": "application/json",
};
```

O `sessionUserId` deve ser persistido em `localStorage` após o join.

### Sem autenticação (GUEST)

Rotas públicas (escanear QR, ver cardápio, join) não precisam de headers de auth.

---

## Fluxos Chave

### Fluxo do Staff (Console)

1. Token salvo em localStorage → incluir em todo fetch
2. Trocar pedidos em tempo real via `WS /ws/location/:locationId`
3. Atualizar status: `PUT /orders/:orderId/status` com `{ restaurantId, status }`
4. Fechar mesa: `DELETE /sessions/:sessionId?restaurantId=<id>`

### Fluxo do Cliente (mesa)

1. Escanear QR → `GET /tables/:qrToken/session`
2. Entrar na sessão → `POST /sessions/:id/join` com `{ displayName, clientToken }` (clientToken = UUID v4 gerado e salvo em localStorage)
3. Salvar `sessionUserId` retornado no localStorage
4. Ver cardápio → `GET /restaurants/:id/locations/:id/menu`
5. Fazer pedido → `POST /sessions/:id/orders`
6. Ver conta → `GET /sessions/:id/bill`
7. Pagar → `POST /sessions/:id/payments`

---

## Regras de Integração

### Erros da API

Todos os erros têm shape `{ code: string, message: string }`. Tratar sempre pelo `code`, nunca pela `message`.

```typescript
if (response.status === 422 && data.code === "SESSION_CLOSED") {
  // redirecionar para tela de sessão encerrada
}
```

Códigos relevantes: `SESSION_CLOSED`, `ORDER_NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `FORBIDDEN`, `MENU_ITEM_NOT_FOUND`, `MODIFIER_NOT_FOUND`.

### WebSocket (Realtime)

```typescript
const ws = new WebSocket(`wss://api.juntai.app/ws/location/${locationId}`);

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  // ORDER_CREATED, ORDER_STATUS_CHANGED, PAYMENT_COMPLETED, SESSION_CLOSED, USER_JOINED
};

// Heartbeat obrigatório para manter conexão
setInterval(() => ws.send("ping"), 30_000);
```

Canal da sessão: `WS /ws/session/:sessionId` (app do cliente).  
Canal da filial: `WS /ws/location/:locationId` (console/cozinha).

### Snapshot de pedido é imutável

O campo `items[].snapshot` em `Order` preserva nome e preço no momento da criação. Não usar dados do cardápio atual para exibir histórico de pedidos — usar sempre o `snapshot`.

### Divisão de conta (pagamento parcial)

`portion` em `POST /sessions/:id/payments` vai de `0` a `1` (ex: `0.5` = metade do item). A sessão é fechada automaticamente quando `paidAmount >= totalAmount`.

### IDs são UUID v4

Todos os IDs vêm como string UUID v4. `clientToken` em `POST /sessions/:id/join` deve ser gerado no frontend com `crypto.randomUUID()`.

---

## Hierarquia do Cardápio

```
Menu (por filial)
└── Categoria
    └── Item
        └── ModifierGroup
            └── ModifierOption
```

Apenas itens com `isAvailable: true` e categorias com `isActive: true` aparecem em `GET .../menu`.

---

## Mapa de Permissões (resumo)

| Papel        | Pode fazer                                                     |
| ------------ | -------------------------------------------------------------- |
| GUEST        | Ver cardápio, escanear QR, entrar em sessão                    |
| SESSION_USER | Fazer pedido, ver conta, pagar (apenas na própria sessão)      |
| WAITER       | Tudo do SESSION_USER + atualizar status de pedido, fechar mesa |
| MANAGER      | Tudo do WAITER + gerenciar cardápio (criar/editar/remover)     |
| OWNER        | Acesso total, incluindo criar restaurante, filiais e tokens    |

---

## O que NÃO fazer

- Não duplicar lógica de negócio do backend (preço, status, snapshot) no frontend
- Não exibir `message` de erros da API diretamente ao usuário — mapear para mensagens de UI
- Não armazenar o `rawToken` do staff em sessionStorage (risco de perda) — usar localStorage
- Não gerar IDs manualmente com strings aleatórias — sempre `crypto.randomUUID()`
- Não fazer polling para pedidos em tempo real — usar WebSocket
