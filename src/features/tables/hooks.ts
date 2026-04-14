import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  closeTableSession,
  createTable,
  deleteTable,
  getOrCreateTableSession,
  getTableSessionById,
  joinTableSession,
  addSessionMember,
  guestJoinSession,
  listTableSessionMembers,
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
  const { sessionToken } = useAuth();

  return useMutation({
    mutationFn: async ({ qrCodeToken }: { qrCodeToken: string }) => {
      const session = await getOrCreateTableSession(qrCodeToken, sessionToken);
      return { session };
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

export function useTableSession(sessionId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getTableSessionById(sessionId!, sessionToken),
    enabled: !!sessionId,
  });
}

export function useSessionMembers(sessionId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["session-members", sessionId],
    queryFn: () => listTableSessionMembers(sessionId!, sessionToken),
    enabled: !!sessionId,
  });
}

export function useJoinSession() {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      displayName,
    }: {
      sessionId: string;
      displayName: string;
    }) => joinTableSession(sessionId, displayName, sessionToken),
    onSuccess: async (_member, { sessionId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["session-members", sessionId],
      });
    },
  });
}

export function useAddSessionMember() {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      userId,
      displayName,
    }: {
      sessionId: string;
      userId: string;
      displayName: string;
    }) => addSessionMember(sessionId, userId, displayName, sessionToken),
    onSuccess: async (_member, { sessionId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["session-members", sessionId],
      });
    },
  });
}

export function useGuestJoinSession() {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      email,
      displayName,
    }: {
      sessionId: string;
      email: string;
      displayName: string;
    }) => guestJoinSession(sessionId, email, displayName, sessionToken),
    onSuccess: async (_result, { sessionId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["session-members", sessionId],
      });
    },
  });
}
