import type { TableSession } from "@juntai/types";
import { GuestSessionApp } from "./GuestSessionApp";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function resolveSession(qrToken: string): Promise<TableSession | null> {
  try {
    const res = await fetch(`${API_URL}/tables/${qrToken}/session`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<TableSession>;
  } catch {
    return null;
  }
}

export default async function MesaPage({
  params,
}: {
  params: Promise<{ qrToken: string }>;
}) {
  const { qrToken } = await params;
  const session = await resolveSession(qrToken);

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm font-semibold text-foreground">
          Mesa não encontrada
        </p>
        <p className="text-xs text-muted-foreground">
          O QR Code pode estar desatualizado ou a mesa foi removida.
        </p>
      </div>
    );
  }

  return <GuestSessionApp sessionId={session.id} />;
}
