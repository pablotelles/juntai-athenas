import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  closeTableSession,
  getOrCreateTableSession,
  joinTableSession,
  listTables,
} from "./api";

export function useTables(restaurantId: string, locationId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["tables", restaurantId, locationId],
    queryFn: () => listTables(restaurantId, locationId!, sessionToken),
    enabled: !!restaurantId && !!locationId,
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
