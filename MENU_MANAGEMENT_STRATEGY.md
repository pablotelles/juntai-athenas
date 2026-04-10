# Estratégia — Console de Gestão de Cardápio

> Documento de referência para implementação do gerenciamento de menus, categorias e produtos no Athenas.  
> Atualizado: 2026-04-09

---

## Contexto

O backend (Hermes) já implementa o **Composition Engine** completo:
`StepType`, `PricingStrategy`, `CompositionConfig`, sub-opções, campos de quantidade.  
O frontend precisa expor isso de forma guiada, sem revelar os termos técnicos ao usuário.

---

## Princípio 1 — Fonte canônica de tipos: `@juntai/types`

`@juntai/types` é resolvido via **npm workspace** (`juntai-hermes/lib`), compilado para `dist/`.  
**Nunca declarar tipos localmente** se o tipo já existe na lib.

### Estado atual de `features/menu/types.ts`

```ts
// ✅ já existe — parcialmente correto
export type {
  MenuWithCategories,
  MenuItem,
  Category,
  ModifierGroup,
  ModifierOption,
} from "@juntai/types";

// ❌ ainda faltam — adicionar no Step 1:
// Menu, MenuItemType, StepType, PricingStrategy, CompositionConfig
```

### Tipos já disponíveis em `@juntai/types` (menu.entity.ts)

```ts
// Tipos enum
type MenuItemType = "simple" | "composable";
type StepType = "choice" | "multi" | "composition" | "quantity";
type PricingStrategy = "sum" | "max" | "average";

// Tipo composto
type CompositionConfig = { maxParts: number };

// Entidades
type Menu = {
  id: string;
  restaurantId: string;
  locationId: string | null;
  name: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
};
type Category = {
  id: string;
  menuId: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
};
type ModifierGroup = {
  id: string;
  restaurantId: string;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  stepType: StepType; // ← Composition Engine
  pricingStrategy: PricingStrategy | null; // ← Composition Engine
  compositionConfig: CompositionConfig | null; // ← Composition Engine
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  options: ModifierOption[];
};
type ModifierOption = {
  id: string;
  modifierGroupId: string;
  parentOptionId: string | null; // ← sub-opções (composition)
  name: string;
  priceDelta: number;
  minQuantity: number; // ← quantity step
  maxQuantity: number | null; // ← quantity step
  unitPrice: number | null; // ← quantity step
  isAvailable: boolean;
  displayOrder: number;
  childOptions?: ModifierOption[];
};
type MenuItem = {
  id: string;
  type: MenuItemType; // ← "simple" | "composable"
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  mediaUrls: string[] | null;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
  modifierGroups: ModifierGroup[];
};
type MenuWithCategories = Menu & {
  categories: Array<Category & { items: MenuItem[] }>;
};
```

---

## Princípio 2 — SDK: `createJuntaiClient` via `@juntai/types`

`@juntai/types` exporta o SDK completo. **Toda função em `api.ts` usa `createJuntaiClient`**, não o `apiClient` raw.

### Módulo `menu` atual (já existente em `lib/modules/menu.ts`)

```ts
createJuntaiClient({ baseUrl, token }).menu.get(restaurantId, locationId);
// → Promise<MenuWithCategories[]>
// GET /restaurants/:restaurantId/locations/:locationId/menu
```

### Métodos a adicionar no SDK (`lib/modules/menu.ts`) — Step 2

O SDK precisa ser estendido com os métodos de escrita. Cada método abaixo define a assinatura esperada:

```ts
// ── Menus ────────────────────────────────────────────────────────────────────
menu.createMenu(restaurantId: string, body: {
  name: string;
  locationId: string;
  displayOrder?: number;
}): Promise<Menu>
// POST /restaurants/:restaurantId/menus

// ── Categorias ───────────────────────────────────────────────────────────────
menu.createCategory(menuId: string, body: {
  restaurantId: string;
  name: string;
  displayOrder?: number;
}): Promise<Category>
// POST /menus/:menuId/categories

menu.patchCategory(categoryId: string, body: {
  restaurantId: string;
  name?: string;
  isActive?: boolean;
  displayOrder?: number;
}): Promise<Category>
// PATCH /categories/:categoryId

menu.deleteCategory(categoryId: string, restaurantId: string): Promise<void>
// DELETE /categories/:categoryId  — body: { restaurantId }

// ── Itens ────────────────────────────────────────────────────────────────────
menu.createItem(categoryId: string, body: {
  restaurantId: string;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  mediaUrls?: string[];
  type?: MenuItemType;       // "simple" | "composable"  (default: "simple")
  displayOrder?: number;
}): Promise<MenuItem>
// POST /categories/:categoryId/items

menu.patchItem(itemId: string, body: {
  restaurantId: string;
  name?: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  displayOrder?: number;
}): Promise<MenuItem>
// PATCH /items/:itemId

menu.deleteItem(itemId: string, restaurantId: string): Promise<void>
// DELETE /items/:itemId  — body: { restaurantId }

// ── Modifier Groups ──────────────────────────────────────────────────────────
menu.createModifierGroup(restaurantId: string, body: {
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  stepType: StepType;                           // Composition Engine
  pricingStrategy?: PricingStrategy;            // Composition Engine
  compositionConfig?: CompositionConfig;        // Composition Engine — obrig. se stepType="composition"
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
}): Promise<ModifierGroup>
// POST /restaurants/:restaurantId/modifier-groups

// ── Modifier Options ─────────────────────────────────────────────────────────
menu.createModifierOption(groupId: string, body: {
  restaurantId: string;
  name: string;
  priceDelta?: number;
  parentOptionId?: string;        // sub-opção (composition)
  minQuantity?: number;           // quantity step
  maxQuantity?: number | null;    // quantity step
  unitPrice?: number | null;      // quantity step
  displayOrder?: number;
}): Promise<ModifierOption>
// POST /modifier-groups/:groupId/options

// ── Attach ───────────────────────────────────────────────────────────────────
menu.attachModifierGroup(itemId: string, groupId: string, restaurantId: string): Promise<void>
// POST /items/:itemId/modifier-groups/:groupId  — body: { restaurantId }
```

### Padrão `api.ts` (seguir `features/orders/api.ts` e `features/users/api.ts`)

```ts
import { createJuntaiClient } from "@juntai/types";
import type {
  Menu,
  Category,
  MenuItem,
  ModifierGroup,
  ModifierOption,
} from "@juntai/types";
import type {
  MenuItemType,
  StepType,
  PricingStrategy,
  CompositionConfig,
} from "@juntai/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Cada função cria um cliente com o token da chamada:
export function createMenu(
  restaurantId: string,
  body: { name: string; locationId: string },
  token: string | null,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).menu.createMenu(
    restaurantId,
    body,
  );
}
// ... demais funções no mesmo padrão
```

---

## Mapeamento UX → SDK (StepType)

| Label na UI                     | `stepType`    | `selectionType` | `pricingStrategy` | `compositionConfig`           |
| ------------------------------- | ------------- | --------------- | ----------------- | ----------------------------- |
| Escolha única                   | `choice`      | `SINGLE`        | `sum`             | `null`                        |
| Múltiplas escolhas              | `multi`       | `MULTIPLE`      | `sum`             | `null`                        |
| Dividir em partes (pizza/combo) | `composition` | `MULTIPLE`      | `max`             | `{ maxParts: N }` obrigatório |
| Quantidade                      | `quantity`    | `MULTIPLE`      | `sum`             | `null`                        |

> Esses valores são passados diretamente para `menu.createModifierGroup(restaurantId, body, token)`.  
> A UI nunca expõe esses termos técnicos — usa os labels da coluna "Label na UI".

---

## Arquitetura de arquivos

### Extensão de `features/menu/` (não criar nova feature)

```
src/features/menu/
├── types.ts           ← CORRIGIR: re-exportar de @juntai/types
├── api.ts             ← ESTENDER: adicionar funções de escrita
├── hooks.ts           ← ESTENDER: adicionar mutation hooks
├── schemas.ts         ← NOVO: schemas Zod para os formulários do builder
├── builder.ts         ← NOVO: tipos do builder, templates, mapper
└── components/
    ├── MenuView.tsx              (existente — não tocar)
    ├── MenuList.tsx              ← NOVO
    ├── MenuCard.tsx              ← NOVO
    ├── CreateMenuModal.tsx       ← NOVO
    ├── CategoryList.tsx          ← NOVO
    ├── CategoryItem.tsx          ← NOVO
    ├── CreateCategoryModal.tsx   ← NOVO
    ├── ProductList.tsx           ← NOVO
    ├── ProductCard.tsx           ← NOVO
    └── ProductBuilder/
        ├── index.tsx
        ├── ProductTypeSelector.tsx
        ├── BasicInfoForm.tsx
        ├── StepsBuilder.tsx
        ├── StepCard.tsx
        ├── OptionItem.tsx
        └── PreviewPanel.tsx
```

### Páginas novas (App Router)

```
src/app/(portal)/menu/
├── page.tsx                     ← SUBSTITUIR: lista de menus por filial
├── [menuId]/
│   └── page.tsx                 ← NOVO: categorias do menu
└── [menuId]/[categoryId]/
    └── page.tsx                 ← NOVO: produtos + ProductBuilder
```

---

## Plano de implementação (steps)

### Step 0 — Instalar dnd-kit

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Necessário para reordenação de categorias.

---

### Step 1 — Completar `features/menu/types.ts`

`types.ts` já re-exporta `MenuWithCategories`, `MenuItem`, `Category`, `ModifierGroup`, `ModifierOption`.  
Adicionar os tipos que faltam:

```ts
export type {
  Menu,
  MenuWithCategories,
  MenuItem,
  Category,
  ModifierGroup,
  ModifierOption,
  MenuItemType,
  StepType,
  PricingStrategy,
  CompositionConfig,
} from "@juntai/types";
```

---

### Step 2 — Estender SDK em `lib/modules/menu.ts` (Hermes) + `features/menu/api.ts` (Athenas)

**Primeiro**: estender `juntai-hermes/lib/modules/menu.ts` com todos os métodos de escrita descritos no Princípio 2.  
**Depois**: rodar `npm run build` em `juntai-hermes/lib/` para gerar o novo `dist/`.  
**Por último**: criar as funções em `features/menu/api.ts` usando `createJuntaiClient`:

```ts
// Estado atual (já existe):
export function getMenu(restaurantId, locationId, token);

// A adicionar:
export function createMenu(restaurantId, body, token);
export function createCategory(menuId, body, token);
export function patchCategory(categoryId, body, token);
export function deleteCategory(categoryId, restaurantId, token);
export function createItem(categoryId, body, token);
export function patchItem(itemId, body, token);
export function deleteItem(itemId, restaurantId, token);
export function createModifierGroup(restaurantId, body, token);
export function createModifierOption(groupId, body, token);
export function attachModifierGroup(itemId, groupId, restaurantId, token);
```

---

### Step 3 — `features/menu/schemas.ts` (NOVO)

Schemas Zod para os formulários da UI. Os campos mapeiam diretamente para os bodies do SDK:

```ts
export const menuFormSchema = z.object({
  name: z.string().min(1).max(200),
  locationId: z.string().uuid(),
});

export const categoryFormSchema = z.object({
  name: z.string().min(1).max(200),
});

export const itemFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  basePrice: z.number().positive(),
  imageUrl: z.string().url().optional(),
  type: z.enum(["simple", "composable"]).default("simple"),
});

// Inclui campos de todas as variantes de StepType:
export const stepFormSchema = z.object({
  name: z.string().min(1),
  stepType: z.enum(["choice", "multi", "composition", "quantity"]),
  isRequired: z.boolean().default(false),
  minSelections: z.number().int().min(0).default(0),
  maxSelections: z.number().int().positive().nullable().optional(),
  compositionConfig: z
    .object({ maxParts: z.number().int().positive() })
    .nullable()
    .optional(),
});

export const optionFormSchema = z.object({
  name: z.string().min(1),
  priceDelta: z.number().default(0),
  unitPrice: z.number().positive().nullable().optional(), // quantity step
  minQuantity: z.number().int().min(0).default(1), // quantity step
  maxQuantity: z.number().int().positive().nullable().optional(), // quantity step
});
```

---

### Step 4 — `features/menu/builder.ts` (NOVO)

```ts
// Tipo local do estado do builder (não é o tipo de API)
export type BuilderOption = {
  id: string; // temporário, frontend-only
  name: string;
  priceDelta: number;
  unitPrice: number | null;
  minQuantity: number;
  maxQuantity: number | null;
  parentOptionId: string | null;
  childOptions: BuilderOption[];
};

export type BuilderStep = {
  id: string; // temporário, frontend-only
  name: string;
  stepType: StepType;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  compositionConfig: CompositionConfig | null;
  options: BuilderOption[];
};

export type BuilderState = {
  type: MenuItemType;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  steps: BuilderStep[];
};
```

**Templates:**

```ts
export function getProductTemplate(
  type: "pizza" | "burger" | "poke",
): BuilderStep[];
```

| Template | Steps gerados                                                            |
| -------- | ------------------------------------------------------------------------ |
| pizza    | Tamanho (choice) + Sabores (composition, maxParts:2) + Borda (choice)    |
| burger   | Ponto (choice) + Adicionais (multi)                                      |
| poke     | Base (choice) + Proteína (choice) + Toppings (multi) + Extras (quantity) |

**Mapper:**

```ts
// Executa a sequência de chamadas API para persistir um produto completo
export async function saveProduct(
  state: BuilderState,
  context: { categoryId: string; restaurantId: string },
  token: string | null,
): Promise<MenuItem>;
```

Sequência interna:

1. `createItem(categoryId, { name, description, basePrice, imageUrl, type }, token)`
2. Para cada step:
   a. `createModifierGroup(restaurantId, { stepType, pricingStrategy, compositionConfig, ... }, token)`
   b. Para cada opção: `createModifierOption(groupId, { name, priceDelta, unitPrice, ... }, token)`
   c. Para cada sub-opção: `createModifierOption(groupId, { ..., parentOptionId }, token)`
3. Para cada step: `attachModifierGroup(itemId, groupId, restaurantId, token)`

---

### Step 5 — Estender `features/menu/hooks.ts`

```ts
// Estado atual (já existe):
export function useMenu(restaurantId, locationId); // useQuery → getMenu

// Mutations atômicas (useAuth().sessionToken → token):
export function useCreateMenu(restaurantId);
export function useCreateCategory(menuId, restaurantId);
export function usePatchCategory(restaurantId);
export function useDeleteCategory(restaurantId);
export function useCreateItem(categoryId, restaurantId);
export function usePatchItem(restaurantId);
export function useDeleteItem(restaurantId);
export function useCreateModifierGroup(restaurantId);
export function useCreateModifierOption(groupId, restaurantId);
export function useAttachModifierGroup(restaurantId);

// Hook orquestrador (usa saveProduct de builder.ts):
// onSuccess → invalida ["menu", restaurantId, locationId]
export function useCreateProduct(categoryId, restaurantId);
```

Todas as mutations usam `useMutation` do `@tanstack/react-query` e chamam as funções de `api.ts`.

---

### Step 6 — Componentes de Menu

**`MenuCard`**: nome do menu, badge ativo/inativo, botão de ações (dropdown).  
**`MenuList`**: lista de `MenuCard` + botão "Novo Menu" que abre `CreateMenuModal`.  
**`CreateMenuModal`**: `Modal` + `Formik` + `menuFormSchema`. Campo: nome + filial (Select de locations).

---

### Step 7 — Componentes de Categoria

**`CategoryItem`**: drag handle (dnd-kit) + nome + switch ativo/inativo + botão editar.  
**`CategoryList`**: `SortableContext` do dnd-kit com lista de `CategoryItem`. Ao reordenar: `patchCategory` com novo `displayOrder`. Botão "Nova Categoria" abre `CreateCategoryModal`.  
**`CreateCategoryModal`**: `Modal` + `Formik` + `categoryFormSchema`.

---

### Step 8 — Componentes de Produto

**`ProductCard`**: nome, preço base, badge tipo (Simples/Personalizável), badge disponível/indisponível, ações.  
**`ProductList`**: lista de `ProductCard` + botão "Novo Produto" que abre `ProductBuilder` em modal.

---

### Step 9 — ProductBuilder

Gerencia estado local com `useReducer`. Dividido em abas ou seções progressivas.

#### `ProductTypeSelector`

Cards clicáveis: **Simples** / **Personalizável**.  
Ao selecionar "Simples", esconde `StepsBuilder`.

#### `BasicInfoForm`

Campos Formik: `name`, `description`, `basePrice`, `imageUrl`.  
Usa `FormField` + `Input` + `FormSubmitButton` existentes.

#### `StepsBuilder`

Lista de `StepCard`. Botões: "Adicionar Etapa" + "Usar Template" (pizza/burger/poke).  
Ao usar template: popula steps via `getProductTemplate`.

#### `StepCard`

- Input: nome do step
- Select: tipo (labels de negócio → `StepType`)
- Checkbox: obrigatório
- Inputs: min / max seleções
- Se `composition`: input "Número de partes" → `compositionConfig.maxParts`
- Lista dinâmica de `OptionItem`

#### `OptionItem`

- Campos base: nome + priceDelta
- Se `quantity`: mostra `unitPrice`, `minQuantity`, `maxQuantity`
- Botão "+" para criar sub-opção (indentada, vinculada via `parentOptionId`)

#### `PreviewPanel`

Renderiza em tempo real como o cliente verá, traduzindo `stepType` para frases:

- `choice` → "Escolha 1 opção"
- `multi` → "Escolha até N opções"
- `composition` → "Escolha N sabores"
- `quantity` → "Adicione quantidades"

---

### Step 10 — Páginas

#### `/menu/page.tsx` (substituir)

```tsx
<MenuList restaurantId={...} locationId={...} />
```

Com `LocationPicker` para selecionar a filial (reutilizar o componente existente).

#### `/menu/[menuId]/page.tsx` (novo)

```tsx
// Breadcrumb: Cardápio > {menuName}
<CategoryList menuId={params.menuId} restaurantId={...} />
```

#### `/menu/[menuId]/[categoryId]/page.tsx` (novo)

```tsx
// Breadcrumb: Cardápio > {menuName} > {categoryName}
<ProductList categoryId={params.categoryId} restaurantId={...} />
```

---

## Dependências entre steps

```
Step 0  (instalar dnd-kit)
  ↓
Step 1  (completar types.ts — adicionar Menu, MenuItemType, StepType, PricingStrategy, CompositionConfig)
  ↓
Step 2  ← BIFURCAÇÃO:
   ├── 2a. Estender lib/modules/menu.ts (Hermes) + npm run build na lib/
   └── 2b. Estender api.ts (Athenas) — depende de 2a
              ↓
Step 3 (schemas.ts)   Step 4 (builder.ts — depende de tipos do Step 1)
     ↓                       ↓
Step 5  (hooks.ts — depende de api.ts + builder.ts)
  ↓
Steps 6, 7, 8  (componentes — podem rodar em paralelo)
  ↓
Step 9  (ProductBuilder — depende de schemas + hooks + builder.ts)
  ↓
Step 10 (páginas — depende de todos os componentes)
```

> **Lembrete**: após cada mudança em `juntai-hermes/lib/`, executar `npm run build` na pasta `lib/` antes de usar nos componentes do Athenas.

---

## O que não mudar

| Arquivo                          | Motivo                                           |
| -------------------------------- | ------------------------------------------------ |
| `features/menu/MenuView.tsx`     | Usado na página de leitura — não é gerenciamento |
| Qualquer feature fora de `menu/` | Zero impacto                                     |
| Componentes primitivos/shared    | Reusar, nunca modificar                          |
| `config/navigation.ts`           | `/menu` já está mapeado corretamente             |

---

## Checklist de critérios de sucesso

- [ ] Criar menu para uma filial
- [ ] Criar categoria dentro do menu
- [ ] Reordenar categorias via drag-and-drop
- [ ] Criar produto simples (Batata Frita com preço)
- [ ] Criar pizza meio a meio via template (composition, maxParts: 2)
- [ ] Criar poke com toppings múltiplos e extras por quantidade
- [ ] Criar hambúrguer simples com ponto e adicionais
- [ ] Preview ao vivo durante criação do produto
- [ ] Nenhum termo técnico (`stepType`, `pricingStrategy`, `compositionConfig`) visível na UI
