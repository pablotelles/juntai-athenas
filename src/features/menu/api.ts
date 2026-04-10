import { createJuntaiClient } from "@juntai/types";
import type {
  MenuWithCategories,
  Menu,
  Category,
  MenuItem,
  ModifierGroup,
  ModifierOption,
} from "@juntai/types";
import type {
  CreateMenuBody,
  PatchMenuBody,
  CreateCategoryBody,
  PatchCategoryBody,
  CreateItemBody,
  PatchItemBody,
  CreateModifierGroupBody,
  CreateModifierOptionBody,
} from "@juntai/types";

export type {
  MenuWithCategories,
  Menu,
  Category,
  MenuItem,
  ModifierGroup,
  ModifierOption,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function client(token: string | null) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).menu;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function getMenu(
  restaurantId: string,
  locationId: string,
  token: string | null,
): Promise<MenuWithCategories[]> {
  return client(token).get(restaurantId, locationId);
}

// ── Menus ─────────────────────────────────────────────────────────────────────

export function createMenu(
  restaurantId: string,
  body: CreateMenuBody,
  token: string | null,
): Promise<Menu> {
  return client(token).createMenu(restaurantId, body);
}

export function patchMenu(
  menuId: string,
  body: PatchMenuBody,
  token: string | null,
): Promise<Menu> {
  return client(token).patchMenu(menuId, body);
}

export function deleteMenu(
  menuId: string,
  restaurantId: string,
  token: string | null,
): Promise<void> {
  return client(token).deleteMenu(menuId, restaurantId);
}

// ── Categories ────────────────────────────────────────────────────────────────

export function createCategory(
  menuId: string,
  body: CreateCategoryBody,
  token: string | null,
): Promise<Category> {
  return client(token).createCategory(menuId, body);
}

export function patchCategory(
  categoryId: string,
  body: PatchCategoryBody,
  token: string | null,
): Promise<Category> {
  return client(token).patchCategory(categoryId, body);
}

export function deleteCategory(
  categoryId: string,
  restaurantId: string,
  token: string | null,
): Promise<void> {
  return client(token).deleteCategory(categoryId, restaurantId);
}

// ── Items ─────────────────────────────────────────────────────────────────────

export function createItem(
  categoryId: string,
  body: CreateItemBody,
  token: string | null,
): Promise<MenuItem> {
  return client(token).createItem(categoryId, body);
}

export function patchItem(
  itemId: string,
  body: PatchItemBody,
  token: string | null,
): Promise<MenuItem> {
  return client(token).patchItem(itemId, body);
}

export function deleteItem(
  itemId: string,
  restaurantId: string,
  cascadeOptions: boolean,
  token: string | null,
): Promise<void> {
  return client(token).deleteItem(itemId, { restaurantId, cascadeOptions });
}

// ── Modifier Groups ───────────────────────────────────────────────────────────

export function deleteModifierGroup(
  groupId: string,
  restaurantId: string,
  token: string | null,
): Promise<void> {
  return client(token).deleteModifierGroup(groupId, restaurantId);
}

export function createModifierGroup(
  restaurantId: string,
  body: CreateModifierGroupBody,
  token: string | null,
): Promise<ModifierGroup> {
  return client(token).createModifierGroup(restaurantId, body);
}

// ── Modifier Options ──────────────────────────────────────────────────────────

export function createModifierOption(
  groupId: string,
  body: CreateModifierOptionBody,
  token: string | null,
): Promise<ModifierOption> {
  return client(token).createModifierOption(groupId, body);
}

// ── Attach ────────────────────────────────────────────────────────────────────

export function attachModifierGroup(
  itemId: string,
  groupId: string,
  restaurantId: string,
  token: string | null,
): Promise<void> {
  return client(token).attachModifierGroup(itemId, groupId, restaurantId);
}
