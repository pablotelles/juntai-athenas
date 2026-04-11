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

## SDK e Tipagem — Regras Obrigatórias

### @juntai/types é a única fonte de verdade para tipos de domínio

Todos os tipos que representam entidades da API vêm exclusivamente do pacote `@juntai/types`.  
**NUNCA** recriar, redefinir ou alterar manualmente tipos que já existem nesse pacote.

```typescript
// CORRETO — importar de @juntai/types (direto ou via re-export do módulo)
import type { Menu, MenuItem, Order } from "@juntai/types";
import type { Order } from "@/features/orders/types"; // re-export canônico

// ERRADO — nunca definir inline tipos que já existem
interface Order {
  id: string;
  items: any[];
} // ← PROIBIDO
```

### Re-exports por módulo

Cada `src/features/<módulo>/types.ts` re-exporta de `@juntai/types` e adiciona apenas shapes Athenas-específicos (paginação, estados de UI). Antes de criar qualquer tipo novo:

1. Verificar `@juntai/types` (package instalado)
2. Verificar `src/features/*/types.ts`
3. Verificar `src/types/auth.ts`

Criar tipo novo apenas se não existir em nenhum desses lugares.

### apiClient — única forma de chamar a API

Toda chamada HTTP usa `apiClient()` de `src/lib/api.ts`. Nunca usar `fetch` direto.

```typescript
import { apiClient } from "@/lib/api";

// Com autenticação
const data = await apiClient(sessionToken).get<MinhaResposta>("/endpoint");

// Com headers extras (multi-tenant)
const data = await apiClient(token).get<T>("/endpoint", {
  "X-Restaurant-Id": restaurantId,
  "X-Location-Id": locationId,
});
```

`ApiError` (de `src/lib/api.ts`) é o único tipo de erro de API — tratar pelo `err.code`, nunca pela `message`.

---

## Formulários — Padrão Obrigatório (Formik)

**Todo formulário** usa: `useFormik` + `FormikProvider` + `toFormikValidationSchema` + `<FormField>` + `<FormSubmitButton>`.

**NUNCA usar**: react-hook-form, `<button type="submit">` avulso, controlled inputs manuais sem Formik.

### Imports canônicos

```typescript
import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  FormField,
  FormSubmitButton,
} from "@/components/shared/form-field/FormField";
```

### Estrutura mínima de todo formulário

```tsx
const formik = useFormik<MinhaValues>({
  initialValues: { campo: "" },
  validationSchema: toFormikValidationSchema(meuZodSchema),
  onSubmit: async (values, helpers) => {
    await onSubmit(values);
    helpers.resetForm();
  },
});

return (
  <FormikProvider value={formik}>
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
      <FormField name="campo" label="Label do campo" required>
        {({ field, hasError }) => (
          <Input
            {...field}
            value={field.value as string}
            aria-invalid={hasError}
          />
        )}
      </FormField>
      <FormSubmitButton>Salvar</FormSubmitButton>
    </form>
  </FormikProvider>
);
```

### FormField — render prop

`<FormField>` recebe `name`, `label`, `required`, `className` e um **render prop** que expõe `{ field, meta, hasError }`.  
`field` contém `name`, `value`, `onChange`, `onBlur` — spread direto no input.  
`hasError` é `meta.touched && !!meta.error` — usar em `aria-invalid`.

### FormSubmitButton

Lê `isSubmitting` do contexto Formik automaticamente — não precisa de prop `loading`.  
Usar sempre no lugar de `<Button type="submit">`.

### Schema de validação

Todo schema fica em `src/features/<módulo>/schemas.ts` com Zod e um `type` inferido:

```typescript
export const meuSchema = z.object({ campo: z.string().min(1) });
export type MeuFormValues = z.infer<typeof meuSchema>;
```

### Exemplo canônico completo

Ver `src/features/restaurants/components/RestaurantFormModal.tsx`.

---

## Estilos — Design Tokens e globals.css

### globals.css é a única fonte de verdade visual

Todas as variáveis CSS do sistema ficam em `src/app/globals.css`. **Nunca hardcodar** valores de cor, sombra, raio ou espaçamento que já existem como token.

### Tokens disponíveis (usar sempre via Tailwind ou `var()`)

| Categoria  | Exemplos de tokens                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Cores      | `--color-primary`, `--color-secondary`, `--color-muted`, `--color-destructive`, `--color-surface`, `--color-border` |
| Tipografia | `--font-sans`, `--font-mono`                                                                                        |
| Raios      | `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), `--radius-xl` (12px), `--radius-2xl` (16px)          |
| Sombras    | `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`                                           |
| Layout     | `--sidebar-width` (240px), `--sidebar-width-collapsed` (64px), `--header-height` (56px)                             |

### Regras de uso

- Para retheme: alterar **somente** `globals.css` — nunca em componentes individuais.
- Usar classes Tailwind mapeadas aos tokens (`bg-primary`, `text-muted-foreground`, `border-border`, etc.).
- Usar `var(--token)` direto apenas quando Tailwind não cobre o caso.
- **Não criar** novas variáveis CSS globais sem adicionar ao bloco de tokens do `globals.css`.

---

## Componentes — Hierarquia e Regras de Reuso

Antes de criar qualquer componente novo, verificar os três níveis abaixo **nesta ordem**.

### 1. Primitivos — `src/components/primitives/`

Átomos visuais sem lógica de negócio. Usar diretamente.

| Componente            | Uso                                                                     |
| --------------------- | ----------------------------------------------------------------------- |
| `Button`              | Todo botão — variantes: `default`, `outline`, `ghost`, `destructive`    |
| `Input`               | Todo campo de texto                                                     |
| `Label`               | Label de campo de formulário (prop `required` nativa)                   |
| `Text`                | Todo texto — variantes: `h1`–`h4`, `sm`, `xs`, prop `muted`             |
| `Badge`               | Tags de status — variantes: `success`, `warning`, `destructive`, `info` |
| `Icon` / `IconButton` | Ícones e botões-ícone                                                   |
| `ActionSheet`         | Menu de ações mobile (bottom sheet de ações)                            |
| `BottomSheet`         | Sheet genérico mobile                                                   |
| `FAB`                 | Floating action button                                                  |
| `FilterChip`          | Chip de filtro selecionável                                             |
| `SearchInput`         | Input com ícone de busca                                                |
| `Toast`               | Notificações inline                                                     |

### 2. Shared — `src/components/shared/`

Composições genéricas reutilizáveis, agnósticas de feature.

| Componente                                               | Uso                                                     |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `FormField` + `FormSubmitButton`                         | Campos de formulário com Formik (ver seção Formulários) |
| `Modal` + `ModalContent/Header/Title/Description/Footer` | Todo dialog/modal                                       |
| `Select` + `SelectTrigger/Content/Item`                  | Selects com radix                                       |
| `Combobox`                                               | Select com busca                                        |
| `Card`                                                   | Container de card                                       |
| `Checkbox`                                               | Checkbox controlado                                     |
| `ConfirmDialog`                                          | Dialog de confirmação destrutiva                        |
| `DropdownMenu`                                           | Menu suspenso                                           |
| `Avatar`                                                 | Avatar de usuário                                       |
| `Popover`                                                | Popover genérico                                        |
| `Switch`                                                 | Toggle switch                                           |
| `Tooltip`                                                | Tooltip                                                 |

### 3. Compositions — `src/components/compositions/`

Componentes de layout e shell da aplicação. Raramente instanciados em features — usados pelo layout global.

| Componente           | Uso                                             |
| -------------------- | ----------------------------------------------- |
| `AppShell`           | Shell principal da aplicação (sidebar + header) |
| `AppHeader`          | Header superior                                 |
| `Sidebar`            | Navegação lateral                               |
| `PageLayout`         | Layout padrão de página com padding e max-width |
| `DataTable`          | Tabela com ordenação, filtros e paginação       |
| `ResponsiveDataView` | DataTable + visualização mobile unificada       |
| `Breadcrumb`         | Trilha de navegação                             |
| `CommandPalette`     | Paleta de comandos (cmd+k)                      |
| `ContextSwitcher`    | Troca de restaurante/contexto                   |
| `ContextDisplay`     | Banner do contexto ativo                        |
| `UserMenu`           | Menu do usuário logado                          |
| `Subheader`          | Subheader de seção                              |

### Regra geral

**Nunca recriar** funcionalidade que já existe nesses três níveis.  
Se o componente que você precisa é uma variação pequena, extender via props — não duplicar.

---

## Storybook — Padrão para Novos Componentes

Todo componente novo em `primitives/`, `shared/` ou `compositions/` deve ter uma story.  
Stories ficam em `src/stories/<nível>/<NomeComponente>.stories.tsx`.

### Template mínimo

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MeuComponente } from "@/components/<nivel>/meu-componente/MeuComponente";

const meta: Meta<typeof MeuComponente> = {
  title: "<Nivel>/MeuComponente", // ex: "Primitives/Badge", "Shared/Modal"
  component: MeuComponente,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MeuComponente>;

export const Default: Story = {
  args: {
    /* props padrão */
  },
};
```

### Regras de story

- `title` segue o padrão `"Primitives/..."`, `"Shared/..."`, `"Compositions/..."`.
- Sempre incluir `tags: ["autodocs"]` para gerar documentação automática.
- Adicionar uma story por variante visual relevante.
- Se o componente precisa de estado (ex: Modal aberto/fechado), usar `render:` com `React.useState`.
- Ver `src/stories/primitives/ActionSheet.stories.tsx` como exemplo de componente com estado.

---

## Context e Roles — Regras de Negócio e Navegação

### Dois contextos de runtime

A aplicação opera em dois contextos mutuamente exclusivos, gerenciados por `ActiveContextProvider`:

| Contexto    | Tipo                                                | Quando ativo                                    |
| ----------- | --------------------------------------------------- | ----------------------------------------------- |
| Plataforma  | `{ type: "platform" }`                              | Admin da plataforma sem restaurante selecionado |
| Restaurante | `{ type: "restaurant"; restaurantId; locationId? }` | Qualquer usuário com um restaurante ativo       |

```typescript
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";

const { context, isPlatform, isRestaurant, setContext } = useActiveContext();
```

### Roles e perfis de portal

Roles vêm de `memberships` no `AuthProvider`. O helper `resolvePortalProfile()` (em `src/lib/access.ts`) traduz memberships + contexto ativo para um perfil simplificado:

| Perfil           | Quem é                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `platform-admin` | `membership.entityType === "platform" && role === "admin"`                                          |
| `owner`          | `membership.entityType === "restaurant" && role === "owner"` (ou platform-admin em ctx restaurante) |
| `operator`       | `role === "manager"` ou `role === "waiter"`                                                         |
| `basic-user`     | Nenhum dos acima                                                                                    |

```typescript
import { resolvePortalProfile } from "@/lib/access";

const profile = resolvePortalProfile(memberships, context.type, restaurantId);
// "platform-admin" | "owner" | "operator" | "basic-user"
```

### Como o contexto afeta a navegação

- **Páginas de restaurante** (`/menu`, `/orders`, `/tables`, `/restaurant`, `/settings`): só renderizam conteúdo quando `context.type === "restaurant"`. Se `isPlatform`, exibir mensagem orientando o usuário a selecionar um restaurante.
- **Páginas de plataforma** (`/admin`, `/users`, `/restaurants`): visíveis apenas para `platform-admin`.
- **Fallback de contexto**: se o usuário não é platform-admin e tem pelo menos um restaurante, o `ActiveContextProvider` força automaticamente `context.type === "restaurant"` para o primeiro da lista.

```tsx
// Padrão obrigatório em páginas de restaurante
const { context } = useActiveContext();
if (context.type !== "restaurant") {
  return (
    <Text variant="sm" muted>
      Selecione um restaurante para continuar.
    </Text>
  );
}
// A partir daqui, context.restaurantId está garantido
```

### Contexto persiste em localStorage

`ActiveContextProvider` salva/lê o contexto ativo em `localStorage` (chave `juntai_active_context`).  
Não persistir contexto manualmente em outros lugares.

### Auth state

`useAuth()` (de `src/contexts/auth/AuthProvider.tsx`) expõe:

- `user`, `memberships`, `sessionToken`, `isAuthenticated`
- `hasRole(entityType, entityId, role)` — verificação pontual de role
- `isPlatformAdmin` — atalho booleano
- `requestMagicLink(email)`, `loginWithToken(email, code)`, `logout()`

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
- Não recriar tipos de domínio que existem em `@juntai/types` — importar sempre
- Não usar `fetch` diretamente — sempre `apiClient()` de `src/lib/api.ts`
- Não criar formulários sem Formik — sempre `useFormik + FormikProvider + FormField`
- Não hardcodar cores, sombras ou raios — sempre tokens de `globals.css`
- Não criar componentes sem verificar primeiro primitives → shared → compositions
- Não criar componente em primitives/shared/compositions sem story no Storybook
