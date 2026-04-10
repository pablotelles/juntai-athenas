import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
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
import {
  getMenu,
  createMenu,
  patchMenu,
  deleteMenu,
  createCategory,
  patchCategory,
  deleteCategory,
  createItem,
  patchItem,
  deleteItem,
  createModifierGroup,
  deleteModifierGroup,
  createModifierOption,
  attachModifierGroup,
} from "./api";
import { saveProduct, updateProduct, type BuilderState } from "./builder";

// ── Query keys ────────────────────────────────────────────────────────────────

export const menuKeys = {
  all: (restaurantId: string) => ["menu", restaurantId] as const,
  byLocation: (restaurantId: string, locationId: string | null) =>
    ["menu", restaurantId, locationId] as const,
};

// ── Read ──────────────────────────────────────────────────────────────────────

export function useMenu(restaurantId: string, locationId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: menuKeys.byLocation(restaurantId, locationId),
    queryFn: () => getMenu(restaurantId, locationId!, sessionToken),
    enabled: !!restaurantId && !!locationId,
  });
}

// ── Menus ─────────────────────────────────────────────────────────────────────

export function useCreateMenu(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMenuBody) =>
      createMenu(restaurantId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

export function usePatchMenu(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, body }: { menuId: string; body: PatchMenuBody }) =>
      patchMenu(menuId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.all(restaurantId) });
    },
  });
}

export function useDeleteMenu(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (menuId: string) => deleteMenu(menuId, restaurantId, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.all(restaurantId) });
    },
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useCreateCategory(menuId: string, restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryBody) =>
      createCategory(menuId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

export function usePatchCategory(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: string;
      body: PatchCategoryBody;
    }) => patchCategory(categoryId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

export function useDeleteCategory(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) =>
      deleteCategory(categoryId, restaurantId, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

// ── Items ─────────────────────────────────────────────────────────────────────

export function useCreateItem(categoryId: string, restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateItemBody) =>
      createItem(categoryId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

export function usePatchItem(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body: PatchItemBody }) =>
      patchItem(itemId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

export function useDeleteItem(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      cascadeOptions,
    }: {
      itemId: string;
      cascadeOptions: boolean;
    }) => deleteItem(itemId, restaurantId, cascadeOptions, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

// ── Modifier Groups ───────────────────────────────────────────────────────────

export function useDeleteModifierGroup(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      deleteModifierGroup(groupId, restaurantId, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: menuKeys.all(restaurantId) });
    },
  });
}


export function useCreateModifierGroup(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateModifierGroupBody) =>
      createModifierGroup(restaurantId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

// ── Modifier Options ──────────────────────────────────────────────────────────

export function useCreateModifierOption(groupId: string, restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateModifierOptionBody) =>
      createModifierOption(groupId, body, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

// ── Attach ────────────────────────────────────────────────────────────────────

export function useAttachModifierGroup(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, groupId }: { itemId: string; groupId: string }) =>
      attachModifierGroup(itemId, groupId, restaurantId, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.all(restaurantId),
      });
    },
  });
}

// ── Orquestradores: salvar / atualizar produto completo ───────────────────────

export function useCreateProduct(
  categoryId: string,
  restaurantId: string,
  locationId: string | null,
) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (state: BuilderState) =>
      saveProduct(state, { categoryId, restaurantId }, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.byLocation(restaurantId, locationId),
      });
    },
  });
}

export function useUpdateProduct(
  restaurantId: string,
  locationId: string | null,
) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      state,
      existingGroupIds,
    }: {
      itemId: string;
      state: BuilderState;
      existingGroupIds: string[];
    }) =>
      updateProduct(itemId, state, { restaurantId, existingGroupIds }, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: menuKeys.byLocation(restaurantId, locationId),
      });
    },
  });
}
