# Juntai Console — Architecture Plan

> Status: Planning Phase
> Stack: Next.js 15 (App Router) + React + TypeScript

---

## 1. Overview

Juntai Console is the central management portal for the Juntai platform, serving two distinct user types:

- **Juntai Admin** — global platform control
- **Restaurant Partner** — operational management (menu, orders, tables, finance)

The system is built on three pillars:

1. **UI System** — isolated, portable, design-system-ready (`/components`)
2. **Feature Layer** — business logic, API integration (`/features`)
3. **App Layer** — routing, layouts, orchestration (`/app`)

---

## 2. Project Structure

```
juntai-athenas/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Root redirect
│   │   ├── (admin)/                  # Admin area (Juntai internal)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── restaurants/
│   │   │   ├── users/
│   │   │   └── finance/
│   │   └── (restaurant)/             # Restaurant portal
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       ├── menu/
│   │       ├── orders/
│   │       ├── tables/
│   │       ├── finance/
│   │       └── reports/
│   │
│   ├── components/                   # UI System — isolated, portable
│   │   ├── primitives/               # Base building blocks
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── label/
│   │   │   ├── text/
│   │   │   ├── icon/
│   │   │   ├── box/
│   │   │   └── flex/
│   │   ├── shared/                   # Composed reusable components
│   │   │   ├── form-field/
│   │   │   ├── select/
│   │   │   ├── checkbox/
│   │   │   ├── switch/
│   │   │   ├── modal/
│   │   │   ├── tooltip/
│   │   │   ├── popover/
│   │   │   ├── dropdown-menu/
│   │   │   ├── card/
│   │   │   ├── badge/
│   │   │   └── avatar/
│   │   └── compositions/             # Complex generic components
│   │       ├── data-table/           # CRITICAL — fully generic
│   │       ├── page-layout/
│   │       ├── sidebar/
│   │       └── header/
│   │
│   ├── features/                     # Business logic (domain-coupled)
│   │   ├── auth/
│   │   ├── restaurants/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── tables/
│   │   ├── finance/
│   │   └── reports/
│   │
│   ├── lib/                          # Utilities, API client, helpers
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── hooks/                        # Generic reusable hooks
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   └── use-realtime.ts
│   │
│   ├── theme/                        # Design tokens + CSS variables
│   │   ├── tokens.css
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css
│
├── stories/                          # Storybook
│   ├── primitives/
│   ├── shared/
│   └── compositions/
│
├── public/
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 3. Theme System

### Princípio central

> **Tokens são a única fonte de verdade.** Nenhum componente usa cor, espaçamento ou tipografia hardcoded. Tudo consome uma variável CSS. Isso garante que trocar o tema inteiro — paleta, layout, raio de borda — seja uma operação de 1 arquivo.

### Estratégia

- CSS variables como fonte de verdade (`theme/tokens.css`)
- Tailwind consome as variáveis via `tailwind.config.ts` (sem duplicar valores)
- Dark mode via `data-theme="dark"` no `<html>` — sem JavaScript, sem flash
- Zero dependência de runtime — funciona standalone

### Design Base — Juntai Default

O tema inicial é funcional, limpo e de alto contraste — ideal para operações em tempo real. **Toda a paleta pode ser substituída mudando apenas `theme/tokens.css`.**

```css
/* theme/tokens.css */

/* ─────────────────────────────────────────────────────────
   BASE DESIGN: Juntai Default
   Para trocar o tema: só altere os valores abaixo.
   Estrutura (nomes de variáveis) NUNCA muda.
   ───────────────────────────────────────────────────────── */

:root {
  /* --- BRAND --- */
  /* Cor de marca. Troque aqui para mudar o tema inteiro. */
  --brand-hue: 24; /* laranja quente */
  --brand-sat: 94%;
  --brand-lit: 50%;

  /* --- COLORS: Semantic --- */
  --color-primary: hsl(var(--brand-hue) var(--brand-sat) var(--brand-lit));
  --color-primary-hover: hsl(var(--brand-hue) var(--brand-sat) 42%);
  --color-primary-foreground: #ffffff;

  --color-secondary: #f1f5f9; /* slate-100 */
  --color-secondary-hover: #e2e8f0; /* slate-200 */
  --color-secondary-foreground: #334155; /* slate-700 */

  --color-muted: #f8fafc; /* slate-50 */
  --color-muted-foreground: #64748b; /* slate-500 */

  --color-destructive: #ef4444; /* red-500 */
  --color-destructive-hover: #dc2626;
  --color-destructive-foreground: #ffffff;

  --color-success: #22c55e; /* green-500 */
  --color-warning: #f59e0b; /* amber-500 */
  --color-info: #3b82f6; /* blue-500 */

  /* --- COLORS: Surface --- */
  --color-background: #fafafa;
  --color-foreground: #0f172a; /* slate-900 */

  --color-surface: #ffffff; /* cards, modais */
  --color-surface-raised: #ffffff; /* dropdowns, popovers */

  --color-border: #e2e8f0; /* slate-200 */
  --color-border-strong: #cbd5e1; /* slate-300 */

  --color-ring: hsl(var(--brand-hue) var(--brand-sat) var(--brand-lit) / 0.35);

  /* --- COLORS: Sidebar específico --- */
  --color-sidebar-bg: #0f172a; /* slate-900 — dark sidebar */
  --color-sidebar-fg: #94a3b8; /* slate-400 */
  --color-sidebar-fg-active: #ffffff;
  --color-sidebar-item-active: hsl(
    var(--brand-hue) var(--brand-sat) var(--brand-lit) / 0.15
  );
  --color-sidebar-border: #1e293b; /* slate-800 */

  /* --- TYPOGRAPHY --- */
  --font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  --text-2xs: 0.625rem; /* 10px */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* --- SPACING (8px base grid) --- */
  --space-px: 1px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* --- LAYOUT --- */
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 64px;
  --header-height: 56px;
  --content-max-width: 1280px;

  /* --- RADIUS --- */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 6px; /* padrão para inputs, botões */
  --radius-lg: 8px; /* cards */
  --radius-xl: 12px; /* modais */
  --radius-2xl: 16px;
  --radius-full: 9999px;

  /* --- SHADOWS --- */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px rgb(0 0 0 / 0.04);
  --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04);
  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.07), 0 2px 4px rgb(0 0 0 / 0.04);
  --shadow-lg: 0 10px 15px rgb(0 0 0 / 0.08), 0 4px 6px rgb(0 0 0 / 0.04);
  --shadow-xl: 0 20px 25px rgb(0 0 0 / 0.1), 0 8px 10px rgb(0 0 0 / 0.04);

  /* --- TRANSITIONS --- */
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 250ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─────────────────────────────────────────────────────────
   DARK MODE
   Mesma estrutura. Só os valores mudam.
   ───────────────────────────────────────────────────────── */

[data-theme="dark"] {
  --color-background: #0a0a0f;
  --color-foreground: #f1f5f9;

  --color-surface: #141420;
  --color-surface-raised: #1c1c2a;

  --color-secondary: #1e293b;
  --color-secondary-hover: #334155;
  --color-secondary-foreground: #cbd5e1;

  --color-muted: #0f172a;
  --color-muted-foreground: #64748b;

  --color-border: #1e293b;
  --color-border-strong: #334155;

  --color-sidebar-bg: #09090d;
  --color-sidebar-border: #141420;
}
```

### Integração com Tailwind

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          foreground: "var(--color-secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          hover: "var(--color-destructive-hover)",
          foreground: "var(--color-destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        ring: "var(--color-ring)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        sidebar: {
          bg: "var(--color-sidebar-bg)",
          fg: "var(--color-sidebar-fg)",
          "fg-active": "var(--color-sidebar-fg-active)",
          active: "var(--color-sidebar-item-active)",
          border: "var(--color-sidebar-border)",
        },
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-width-collapsed)",
        header: "var(--header-height)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
```

### Como trocar o tema

Para mudar **toda a identidade visual** da aplicação, só é necessário alterar `theme/tokens.css`:

```
Mudar paleta de cores    → alterar as variáveis --color-* em :root
Mudar cor de marca       → alterar --brand-hue, --brand-sat, --brand-lit
Mudar tipografia         → alterar --font-sans
Mudar layout da sidebar  → alterar --sidebar-width, --header-height
Mudar bordas/raio        → alterar --radius-*
Mudar para dark sidebar claro → alterar --color-sidebar-* no :root
```

Nenhum componente precisa ser tocado.

---

## 4. UI System — Key Components

### 4.1 Primitives

Each primitive follows this contract:

```tsx
// All primitives accept className for extensibility
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
}
```

**Primitives to implement (Phase 1):**

| Component | Description                               |
| --------- | ----------------------------------------- |
| `Button`  | All variants, loading state, icon support |
| `Input`   | Text, number, password, with error state  |
| `Label`   | Accessible, linked to inputs              |
| `Text`    | Typography scale (h1–h6, p, span)         |
| `Icon`    | Wrapper over Lucide React                 |
| `Box`     | Generic `div` with style helpers          |
| `Flex`    | Flex container with common props          |

---

### 4.2 Shared Components

**Shared to implement (Phase 1):**

| Component      | Key Notes                                                  |
| -------------- | ---------------------------------------------------------- |
| `FormField`    | label + input + error, integrado com Formik via `useField` |
| `Select`       | react-select wrapped, fully decoupled                      |
| `Checkbox`     | Accessible, controlled/uncontrolled                        |
| `Switch`       | Toggle with label support                                  |
| `Modal`        | Radix Dialog, portal-based                                 |
| `Tooltip`      | Radix Tooltip                                              |
| `Popover`      | Radix Popover                                              |
| `DropdownMenu` | Radix DropdownMenu — used in table row actions             |
| `Card`         | Container with header/content/footer slots                 |
| `Badge`        | Status indicators (colors via variant)                     |
| `Avatar`       | Image with fallback initials                               |

---

### 4.3 DataTable (Critical)

The DataTable is the most critical generic component. Used everywhere: orders, restaurants, transactions, reports.

**Contract:**

```tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode; // custom render
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: PaginationConfig;
  selection?: SelectionConfig<T>;
  onRowAction?: (action: string, row: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}
```

**Features:**

- Generic over `T` — zero domain knowledge
- Custom cell rendering via `column.cell`
- Row actions via `DropdownMenu` in a dedicated column
- Sorting (client-side initially, server-side ready)
- Pagination (controlled)
- Row selection with checkboxes
- Loading skeleton state
- Empty state slot

---

### 4.4 Form System

> **Formik** gerencia todo o estado do formulário. **Zod** valida via `toFormikValidationSchema` (pacote `zod-formik-adapter`). Os componentes de UI não têm conhecimento de Formik — a integração acontece nas camadas de features.

#### Camadas

```
UI (/components)       → Input, Select, Checkbox, Switch — puros, aceitam value/onChange
Form UI (/components)  → FormField, FormControl, FormError — leem contexto do Formik
Feature Forms (/features/**/components/) → formulários concretos com schema Zod
```

#### Componentes do sistema de UI

```tsx
// components/shared/form-field/FormField.tsx
// Usa useField do Formik para conectar ao contexto automaticamente
import { useField } from "formik";

interface FormFieldProps {
  name: string;
  label?: string;
  className?: string;
  children: (
    field: FieldInputProps<unknown>,
    meta: FieldMetaProps<unknown>,
  ) => React.ReactNode;
}

export function FormField({
  name,
  label,
  className,
  children,
}: FormFieldProps) {
  const [field, meta] = useField(name);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <FormControl>{children(field, meta)}</FormControl>
      {meta.touched && meta.error && <FormError>{meta.error}</FormError>}
    </div>
  );
}
```

#### Padrão de uso em features

```tsx
// features/menu/components/CreateItemForm.tsx
"use client";
import { Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { createMenuItemSchema } from "../schema";

export function CreateItemForm({
  onSubmit,
}: {
  onSubmit: (values: CreateMenuItemInput) => void;
}) {
  return (
    <Formik
      initialValues={{ name: "", price: 0, description: "" }}
      validationSchema={toFormikValidationSchema(createMenuItemSchema)}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <FormField name="name" label="Nome">
            {(field) => <Input {...field} placeholder="Ex: X-Burguer" />}
          </FormField>

          <FormField name="price" label="Preço">
            {(field) => <Input {...field} type="number" />}
          </FormField>

          <Button type="submit" loading={isSubmitting}>
            Criar item
          </Button>
        </Form>
      )}
    </Formik>
  );
}
```

#### Schema Zod na feature

```ts
// features/menu/schema.ts
import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(80),
  price: z.number().min(0).multipleOf(0.01),
  description: z.string().max(255).optional(),
  categoryId: z.string().uuid(),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
```

#### Regras

- `FormField`, `FormControl`, `FormError` vivem em `/components/shared/` — sem domínio
- Schemas Zod vivem exclusivamente em `/features/**/schema.ts`
- O componente `<Form>` de UI é apenas um `<form>` com `className` — Formik's `<Form>` é importado diretamente nas features
- Nunca passar `formik` como prop para componentes de UI

---

### 4.5 Layout Compositions

```tsx
// Generic — used by both admin and restaurant layouts
<PageLayout>
  <Sidebar items={navItems} />
  <Header title="..." actions={<Button>...</Button>} />
  <main>{children}</main>
</PageLayout>
```

Sidebar `items` config shape:

```tsx
interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
}
```

---

## 5. App Layer — Routes

### Admin Area `/app/(admin)/`

| Route               | Page                          |
| ------------------- | ----------------------------- |
| `/dashboard`        | Platform overview metrics     |
| `/restaurants`      | Restaurants list + management |
| `/restaurants/[id]` | Restaurant detail             |
| `/users`            | User & access management      |
| `/finance`          | Transactions, fees, payouts   |

### Restaurant Portal `/app/(restaurant)/`

| Route        | Page                                        |
| ------------ | ------------------------------------------- |
| `/dashboard` | Real-time operational overview              |
| `/menu`      | Menu builder (categories, items, modifiers) |
| `/orders`    | Live order management                       |
| `/tables`    | Table grid + QR Code generation             |
| `/finance`   | Payments, splits, status                    |
| `/reports`   | Sales, items, periods                       |

---

## 6. Features Layer

Each feature owns:

```
/features/orders/
  ├── api.ts          # Raw API calls — plain async functions, no React
  ├── queries.ts      # React Query hooks (useQuery / useMutation)
  ├── types.ts        # Domain types
  ├── schema.ts       # Zod schemas
  └── components/     # Feature-specific UI (OrderStatusBadge, etc.)
```

**Feature components are the only place where domain language is allowed.**

### React Query Pattern

All data fetching is handled via React Query hooks inside `/features/**/queries.ts`. Components never call `api.ts` directly.

**`api.ts` — pure async functions:**

```ts
// features/orders/api.ts
export async function fetchOrders(restaurantId: string): Promise<Order[]> {
  const res = await apiClient.get(`/restaurants/${restaurantId}/orders`);
  return res.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const res = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return res.data;
}
```

**`queries.ts` — React Query hooks, sem side effects internos:**

> O hook expõe apenas a operação. Quem invoca decide o que fazer no sucesso ou erro — toast, redirect, log, invalidação extra. O hook só faz o invalidate mínimo necessário para consistência de cache.

```ts
// features/orders/queries.ts
export function useOrders(restaurantId: string) {
  return useQuery({
    queryKey: queryKeys.orders.byRestaurant(restaurantId),
    queryFn: () => fetchOrders(restaurantId),
    staleTime: 30_000,
  });
}

interface UseUpdateOrderStatusOptions {
  onSuccess?: (data: Order, payload: UpdateOrderStatusPayload) => void;
  onError?: (error: Error, payload: UpdateOrderStatusPayload) => void;
}

export function useUpdateOrderStatus(options?: UseUpdateOrderStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) =>
      updateOrderStatus(payload.orderId, payload.status),
    onSuccess: (data, payload) => {
      // invalidação de cache sempre acontece — é responsabilidade do hook
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      // callback do caller — opcional
      options?.onSuccess?.(data, payload);
    },
    onError: (error, payload) => {
      options?.onError?.(error as Error, payload);
    },
  });
}
```

**Usage in feature components:**

```tsx
// features/orders/components/OrdersTable.tsx
"use client";

export function OrdersTable({ restaurantId }: { restaurantId: string }) {
  const { data: orders, isLoading } = useOrders(restaurantId);

  const { mutate: updateStatus } = useUpdateOrderStatus({
    onSuccess: () => toast.success("Status atualizado"),
    onError: () => toast.error("Erro ao atualizar status"),
  });

  return (
    <DataTable
      data={orders ?? []}
      columns={orderColumns}
      isLoading={isLoading}
    />
  );
}
```

**Regra:** invalidações de cache são responsabilidade do hook. Feedback de UI (toast, redirect, log) é responsabilidade do caller.

### API Client (`/lib/api.ts`)

Single axios (or fetch-based) client, configured once:

```ts
// lib/api.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) redirectToLogin();
    return Promise.reject(error);
  },
);

export { apiClient };
```

### Query Key Convention

Centralized query keys prevent cache collisions:

```ts
// lib/query-keys.ts
export const queryKeys = {
  orders: {
    all: ["orders"] as const,
    byRestaurant: (id: string) => ["orders", id] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  menu: {
    all: ["menu"] as const,
    byRestaurant: (id: string) => ["menu", id] as const,
  },
  // ...
};
```

### QueryClientProvider

Configured at root, outside the app shell:

```tsx
// app/providers.tsx
"use client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

---

## 7. Real-Time Strategy

> Core product requirement: orders, status, payments must update live.

**Approach:** WebSockets via the backend (to be confirmed), abstracted via a `useRealtime` hook.

```tsx
// hooks/use-realtime.ts
function useRealtime<T>(channel: string): {
  data: T | null;
  status: "connecting" | "connected" | "disconnected";
};
```

Feature hooks subscribe via `useRealtime`:

```tsx
// features/orders/hooks.ts
function useOrders(restaurantId: string) {
  const { data } = useRealtime<Order[]>(`orders:${restaurantId}`);
  // ...
}
```

---

## 8. Server vs Client Components

| Pattern              | Location                   | Strategy                                                  |
| -------------------- | -------------------------- | --------------------------------------------------------- |
| Page initial data    | `/app/**/page.tsx`         | Server Component — `async` fetch direto (sem React Query) |
| Layouts & navigation | `/app/**/layout.tsx`       | Server Component                                          |
| DataTable com ações  | `/features/**/components/` | `"use client"` + React Query hook                         |
| Forms                | `/features/**/components/` | `"use client"` + useMutation                              |
| Real-time views      | `/features/**/components/` | `"use client"` + useQuery com refetch                     |
| UI primitives        | `/components/primitives/`  | Sem diretiva (client-agnostic)                            |

> **Regra:** React Query é exclusivo do cliente. Server Components fazem fetch direto ao BE e passam dados como props.

---

## 9. Tech Stack

| Concern       | Library                                       |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 15 (App Router)                       |
| Language      | TypeScript                                    |
| Styling       | Tailwind CSS v4                               |
| UI Primitives | Radix UI (Tooltip, Popover, Dialog, Dropdown) |
| Icons         | Lucide React                                  |
| Forms         | Formik + zod-formik-adapter + Zod             |
| Select        | react-select (wrapped)                        |
| Data fetching | React Query (TanStack Query v5)               |
| Real-time     | WebSocket / SSE (TBD by backend)              |
| Storybook     | Storybook 8                                   |
| Testing       | Vitest + Testing Library                      |

---

## 10. Storybook

```
stories/
  primitives/
    Button.stories.tsx       # default, variants, sizes, loading, disabled
    Input.stories.tsx
    Badge.stories.tsx
  shared/
    Card.stories.tsx
    Modal.stories.tsx
    FormField.stories.tsx
  compositions/
    DataTable.stories.tsx    # with mock data, sorting, pagination, actions
    Sidebar.stories.tsx
    PageLayout.stories.tsx
```

Every story must:

- Work without a backend (mock data only)
- Show all visual states
- Use Storybook Controls for dynamic prop editing

---

## 11. Implementation Phases

### Phase 1 — Foundation (current scope)

- [ ] Project scaffolding (Next.js + TS + Tailwind)
- [ ] Theme system (tokens, CSS variables, dark mode)
- [ ] Primitives: Button, Input, Label, Text, Icon, Box, Flex
- [ ] Shared: Card, Badge, Avatar, Modal, Tooltip, Popover, DropdownMenu
- [ ] DataTable (generic, full-featured)
- [ ] Form system (Form, FormField, FormControl, FormError)
- [ ] Layout compositions (PageLayout, Sidebar, Header)
- [ ] Storybook configured with Phase 1 stories

### Phase 2 — App Shell

- [ ] App Router route structure
- [ ] Admin layout + nav
- [ ] Restaurant layout + nav
- [ ] Authentication flow

### Phase 3 — Features

- [ ] Menu builder
- [ ] Order management (real-time)
- [ ] Table management + QR Code
- [ ] Finance views
- [ ] Admin: restaurant management, user management
- [ ] Reports

---

## 12. Key Rules (Enforced)

1. `/components` never imports from `/features` or `/app`
2. Domain names (`Order`, `Restaurant`) never appear inside `/components`
3. All components accept `className` — styles are never locked
4. Default to Server Components; use `"use client"` only when necessary
5. Validation schemas live in `/features/**/schema.ts`, not in components
6. Real-time logic lives in `/hooks/use-realtime.ts` and feature hooks — never in UI components
