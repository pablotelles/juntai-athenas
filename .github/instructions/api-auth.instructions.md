---
description: "Use when implementing authentication, login, token storage, session user, staff token, or any API fetch that requires Authorization headers. Covers staff auth (Bearer token) and session user auth (X-Session-User-Id)."
applyTo: "src/**/auth/**,src/**/*token*,src/**/*session*,src/**/*auth*"
---

# Autenticação Hermes — Padrões

## Staff (OWNER / MANAGER / WAITER)

Todo fetch autenticado de staff deve incluir **os três headers**:

```typescript
const headers = {
  Authorization: `Bearer ${token}`,       // rawToken de POST /users/:id/staff-tokens
  "X-Restaurant-Id": restaurantId,
  "X-Location-Id": locationId,
  "Content-Type": "application/json",
};
```

- `token` vem de `POST /users/:id/staff-tokens` — exibido **uma única vez**, persistir em `localStorage`
- Nunca reusar `tokenHash` — apenas o `rawToken` retornado no campo `token`
- Sem `X-Location-Id`, o servidor resolve como GUEST

## Cliente de Mesa (SESSION_USER)

```typescript
const headers = {
  "X-Session-User-Id": sessionUserId,
  "Content-Type": "application/json",
};
```

- `sessionUserId` = campo `id` retornado por `POST /sessions/:id/join`
- Persistir no `localStorage` imediatamente após o join
- `clientToken` para o join deve ser gerado com `crypto.randomUUID()` e também salvo em localStorage (permite re-entry idempotente)

## GUEST (sem auth)

Rotas públicas — sem nenhum header de auth:
- `GET /tables/:qrToken/session`
- `GET /restaurants/:id/locations/:id/menu`
- `POST /sessions/:id/join`

## Fluxo do Staff no Console

```typescript
// 1. Ler token armazenado
const token = localStorage.getItem("juntai_staff_token");
const restaurantId = localStorage.getItem("juntai_restaurant_id");
const locationId = localStorage.getItem("juntai_location_id");

// 2. Helper para fetch autenticado
function staffFetch(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Restaurant-Id": restaurantId!,
      "X-Location-Id": locationId!,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
```

## Fluxo do Cliente na Mesa

```typescript
// Gerado UMA vez e salvo em localStorage
function getOrCreateClientToken(): string {
  const key = "juntai_client_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

// Após POST /sessions/:id/join
function saveSessionUser(sessionUserId: string) {
  localStorage.setItem("juntai_session_user_id", sessionUserId);
}
```

## Erros de Auth

| Código | HTTP | Causa |
|--------|------|-------|
| `FORBIDDEN` | 403 | Papel insuficiente para a rota |
| `SESSION_USER_NOT_IN_SESSION` | 404 | sessionUserId não pertence à sessão |
| `SESSION_USER_ALREADY_LINKED` | 409 | clientToken já vinculado |
