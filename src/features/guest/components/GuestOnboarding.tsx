"use client";

import * as React from "react";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { Input } from "@/components/primitives/input/Input";
import { Text } from "@/components/primitives/text/Text";
import { apiClient } from "@/lib/api";
import { useGuest } from "@/features/guest/context/GuestContext";

interface GuestJoinResult {
  token: string;
  user: { id: string; name: string | null; email: string | null };
  member: { id: string; displayName: string };
}

/**
 * First-screen shown to a guest who has not yet joined the session.
 * Collects name + email (required by the backend to create/find a user account)
 * and calls POST /sessions/:sessionId/guest-join.
 */
export function GuestOnboarding() {
  const { sessionId, join } = useGuest();

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient().post<GuestJoinResult>(
        `/sessions/${sessionId}/guest-join`,
        { email: email.trim(), displayName: displayName.trim() },
      );
      join(result.token, result.member.id, result.member.displayName);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao entrar na mesa.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-10">
      {/* Logo / Icon */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UtensilsCrossed size={28} />
        </div>
        <Text variant="lg" className="font-bold">
          Bem-vindo!
        </Text>
        <Text variant="sm" muted className="max-w-xs text-center">
          Informe seu nome para entrar na mesa e acompanhar o pedido em tempo
          real.
        </Text>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Text variant="sm" className="font-medium">
            Seu nome
          </Text>
          <Input
            placeholder="Ex: Maria"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            minLength={1}
            maxLength={60}
            autoFocus
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Text variant="sm" className="font-medium">
            E-mail
          </Text>
          <Input
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Text variant="xs" muted>
            Usado para identificar sua conta. Não enviamos spam.
          </Text>
        </div>

        {error && (
          <Text variant="sm" className="text-destructive">
            {error}
          </Text>
        )}

        <Button
          type="submit"
          loading={isLoading}
          disabled={!displayName.trim() || !email.trim()}
          className="mt-1 w-full"
        >
          Entrar na mesa
        </Button>
      </form>
    </div>
  );
}
