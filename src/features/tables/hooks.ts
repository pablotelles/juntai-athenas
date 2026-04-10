import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  closeTableSession,
  createTable,
  deleteTable,
  getOrCreateTableSession,
  joinTableSession,
  listTables,
  updateTable,
  type CreateTableBody,
  type UpdateTableBody,
} from "./api";

export function useTables(restaurantId: string, locationId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["tables", restaurantId, locationId],
    queryFn: () => listTables(restaurantId, locationId!, sessionToken),
    enabled: !!restaurantId && !!locationId,
  });
}

export function useCreateTable(
  restaurantId: string,
  locationId: string | null,
) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTableBody) => {
      if (!locationId) throw new Error("LOCATION_REQUIRED");
      return createTable(restaurantId, locationId, body, sessionToken);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId, locationId],
      });
    },
  });
}

export function useUpdateTable(
  restaurantId: string,
  locationId: string | null,
) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      body,
    }: {
      tableId: string;
      body: UpdateTableBody;
    }) => {
      if (!locationId) throw new Error("LOCATION_REQUIRED");
      return updateTable(restaurantId, locationId, tableId, body, sessionToken);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId, locationId],
      });
    },
  });
}

export function useDeleteTable(
  restaurantId: string,
  locationId: string | null,
) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: string) => {
      if (!locationId) throw new Error("LOCATION_REQUIRED");
      return deleteTable(restaurantId, locationId, tableId, sessionToken);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tables", restaurantId, locationId],
      });
    },
  });
}

export function useConnectTable() {
  const { sessionToken, user } = useAuth();

  return useMutation({
    mutationFn: async ({
      qrCodeToken,
      displayName,
    }: {
      qrCodeToken: string;
      displayName?: string;
    }) => {
      const session = await getOrCreateTableSession(qrCodeToken, sessionToken);
      const member = await joinTableSession(
        session.id,
        displayName ?? user?.name ?? user?.email ?? "Convidado",
        sessionToken,
      );
      return { session, member };
    },
  });
}

export function useCloseTableSession() {
  const { sessionToken } = useAuth();

  return useMutation({
    mutationFn: ({
      sessionId,
      restaurantId,
    }: {
      sessionId: string;
      restaurantId: string;
    }) => closeTableSession(sessionId, restaurantId, sessionToken),
  });
}
