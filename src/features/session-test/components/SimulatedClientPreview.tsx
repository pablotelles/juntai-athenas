import { Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/card/Card";
import { GuestSessionView } from "@/features/tables/components/GuestSessionView";
import type { RealtimeEnvelope } from "@juntai/types";
import type { SimulatedClient } from "./types";

const PREVIEW_SCALE = 0.82;
const PREVIEW_WIDTH = 375 * PREVIEW_SCALE;
const PREVIEW_HEIGHT = 780 * PREVIEW_SCALE;

export interface SimulatedClientPreviewProps {
  activeClient: SimulatedClient | null;
  sessionId: string | null;
  tableLabel?: string;
  onEvent: (envelope: RealtimeEnvelope) => void;
  onOpenManager: () => void;
}

export function SimulatedClientPreview({
  activeClient,
  sessionId,
  tableLabel,
  onEvent,
  onOpenManager,
}: SimulatedClientPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-0 border-b border-border bg-surface p-0">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <CardTitle className="text-sm font-semibold">
            Preview do guest
          </CardTitle>

          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Gerenciar clientes simulados"
            onClick={onOpenManager}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <div className="flex justify-center rounded-[28px] border border-border/70 bg-muted/20 p-3">
          <div
            className="overflow-hidden"
            style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
          >
            {activeClient && sessionId ? (
              <div
                className="origin-top-left"
                style={{
                  transform: `scale(${PREVIEW_SCALE})`,
                  transformOrigin: "top left",
                  width: 375,
                  height: 780,
                }}
              >
                <GuestSessionView
                  sessionId={sessionId}
                  token={activeClient.token}
                  displayName={activeClient.displayName}
                  tableLabel={tableLabel}
                  onEvent={onEvent}
                  interactive
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-[22px] border-4 border-dashed border-border bg-background px-8 text-center">
                <Text variant="xs" muted>
                  Simule um cliente e selecione-o para ver o preview mobile.
                </Text>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
