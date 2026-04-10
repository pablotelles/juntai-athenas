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

Todos os tipos de domínio vêm de `@juntai/types` (mapeado via `tsconfig.paths` para `../juntai-hermes/lib/index.ts`).  
**Nunca declarar tipos localmente** se o tipo já existe na lib.

### Padrão correto (seguir `features/orders/types.ts`)

```ts
// features/menu/types.ts
export type {
  Menu,
  Category,
  MenuItem,
  ModifierGroup,
  ModifierOption,
  MenuWithCategories,
  MenuItemType,
  StepType,
  PricingStrategy,
  CompositionConfig,
} from "@juntai/types";

// Apenas tipos Athenas-específicos ficam aqui
export interface MenusPage { ... }
```

### Ação imediata

`features/menu/types.ts` duplica os tipos localmente — **deve ser substituído** pelo padrão acima antes de qualquer nova feature.

---

## Princípio 2 — A API suporta o Composition Engine completo

O `API_REFERENCE.md` está desatualizado. Os schemas reais do backend (`menu.schema.ts`) confirmam:

| Campo                  | Endpoint                                    | Tipo real                          |
|------------------------|---------------------------------------------|------------------------------------|
| `type`                 | `POST /categories/:id/items`                | `"simple" \| "composable"`         |
| `stepType`             | `POST /restaurants/:id/modifier-groups`     | `"choice" \| "multi" \| "composition" \| "quantity"` |
| `pricingStrategy`      | `POST /restaurants/:id/modifier-groups`     | `"sum" \| "max" \| "average"`      |
| `compositionConfig`    | `POST /restaurants/:id/modifier-groups`     | `{ maxParts: number }`             |
| `parentOptionId`       | `POST /modifier-groups/:id/options`         | `string (uuid)`                    |
| `minQuantity`          | `POST /modifier-groups/:id/options`         | `number`                           |
| `maxQuantity`          | `POST /modifier-groups/:id/options`         | `number \| null`                   |
| `unitPrice`            | `POST /modifier-groups/:id/options`         | `number \| null`                   |

O builder deve usar esses campos diretamente — sem gambiarras de mapeamento.

---

## Mapeamento UX → API (StepType)

| Label na UI                      | `stepType`    | `selectionType` | `pricingStrategy` | Notas                              |
|----------------------------------|---------------|-----------------|-------------------|------------------------------------|
| Escolha única                    | `choice`      | `SINGLE`        | `sum`             | max = 1                            |
| Múltiplas escolhas               | `multi`       | `MULTIPLE`      | `sum`             | min/max configurável               |
| Dividir em partes (pizza/combo)  | `composition` | `MULTIPLE`      | `max`             | `compositionConfig.maxParts` obrig |
| Quantidade                       | `quantity`    | `MULTIPLE`      | `sum`             | opções usam `unitPrice`/`maxQty`   |

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

### Step 1 — Corrigir `features/menu/types.ts`

- Remover declarações locais duplicadas
- Re-exportar tudo de `@juntai/types`
- Adicionar apenas tipos Athenas-específicos (ex: `MenusPage`)

---

### Step 2 — Estender `features/menu/api.ts`

Adicionar funções puras (sem hooks):

```ts
// Menus
createMenu(restaurantId, payload, token)

// Categorias
createCategory(menuId, payload, token)
patchCategory(categoryId, payload, token)   // name, isActive, displayOrder
deleteCategory(categoryId, restaurantId, token)

// Itens
createItem(categoryId, payload, token)      // inclui type: "simple" | "composable"
patchItem(itemId, payload, token)
deleteItem(itemId, restaurantId, token)

// Modifier Groups
createModifierGroup(restaurantId, payload, token)   // inclui stepType, pricingStrategy, compositionConfig
createModifierOption(groupId, payload, token)        // inclui parentOptionId, unitPrice, minQuantity, maxQuantity
attachModifierGroup(itemId, groupId, restaurantId, token)
```

---

### Step 3 — `features/menu/schemas.ts` (NOVO)

Schemas Zod para os formulários da UI (podem ser subsets do schema do backend):

```ts
export const menuFormSchema      // name, locationId
export const categoryFormSchema  // name
export const itemFormSchema      // name, description, basePrice, imageUrl, type
export const stepFormSchema      // name, stepType, isRequired, min, max, compositionConfig
export const optionFormSchema    // name, priceDelta, unitPrice, minQuantity, maxQuantity
```

---

### Step 4 — `features/menu/builder.ts` (NOVO)

```ts
// Tipo local do estado do builder (não é o tipo de API)
export type BuilderOption = {
  id: string  // temporário, frontend-only
  name: string
  priceDelta: number
  unitPrice: number | null
  minQuantity: number
  maxQuantity: number | null
  parentOptionId: string | null
  childOptions: BuilderOption[]
}

export type BuilderStep = {
  id: string  // temporário, frontend-only
  name: string
  stepType: StepType
  isRequired: boolean
  minSelections: number
  maxSelections: number | null
  compositionConfig: CompositionConfig | null
  options: BuilderOption[]
}

export type BuilderState = {
  type: MenuItemType
  name: string
  description: string
  basePrice: number
  imageUrl: string
  steps: BuilderStep[]
}
```

**Templates:**

```ts
export function getProductTemplate(
  type: "pizza" | "burger" | "poke"
): BuilderStep[]
```

| Template | Steps gerados                                                    |
|----------|------------------------------------------------------------------|
| pizza    | Tamanho (choice) + Sabores (composition, maxParts:2) + Borda (choice) |
| burger   | Ponto (choice) + Adicionais (multi)                              |
| poke     | Base (choice) + Proteína (choice) + Toppings (multi) + Extras (quantity) |

**Mapper:**

```ts
// Executa a sequência de chamadas API para persistir um produto completo
export async function saveProduct(
  state: BuilderState,
  context: { categoryId: string; restaurantId: string },
  token: string | null,
): Promise<MenuItem>
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
// Mutations atômicas
useCreateMenu(restaurantId)
useCreateCategory(menuId, restaurantId)
usePatchCategory(restaurantId)
useCreateItem(categoryId, restaurantId)
usePatchItem(restaurantId)
useCreateModifierGroup(restaurantId)
useCreateModifierOption(groupId, restaurantId)
useAttachModifierGroup(restaurantId)

// Hook orquestrador (usa saveProduct internamente)
useCreateProduct(categoryId, restaurantId)
  → onSuccess: invalida ["menu", restaurantId, locationId]
```

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
Step 1  (corrigir types.ts)
  ↓
Step 2  (api.ts)   Step 3 (schemas.ts)   Step 4 (builder.ts)
  ↓                      ↓                     ↓
Step 5  (hooks.ts — depende de api.ts + builder.ts)
  ↓
Steps 6, 7, 8  (componentes — podem rodar em paralelo)
  ↓
Step 9  (ProductBuilder — depende de schemas + hooks + builder.ts)
  ↓
Step 10 (páginas — depende de todos os componentes)
```

---

## O que não mudar

| Arquivo                          | Motivo                              |
|----------------------------------|-------------------------------------|
| `features/menu/MenuView.tsx`     | Usado na página de leitura — não é gerenciamento |
| Qualquer feature fora de `menu/` | Zero impacto                        |
| Componentes primitivos/shared    | Reusar, nunca modificar             |
| `config/navigation.ts`           | `/menu` já está mapeado corretamente |

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
