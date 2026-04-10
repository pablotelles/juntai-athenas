"use client";

import * as React from "react";
import { Text } from "@/components/primitives/text/Text";
import { Badge } from "@/components/primitives/badge/Badge";
import { getStepPreviewLabel, type BuilderState } from "../../builder";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PreviewPanelProps {
  state: BuilderState;
}

export function PreviewPanel({ state }: PreviewPanelProps) {
  const hasInfo = state.name || state.basePrice > 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4 h-full">
      <Text variant="xs" muted className="uppercase tracking-wide font-medium">
        Preview — como o cliente verá
      </Text>

      {!hasInfo ? (
        <Text variant="sm" muted className="italic">
          Preencha nome e preço para ver o preview.
        </Text>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {state.imageUrl ? (
              <img
                src={state.imageUrl}
                alt={state.name}
                className="h-16 w-16 rounded-lg object-cover bg-secondary shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-secondary shrink-0" />
            )}
            <div className="min-w-0">
              <Text variant="sm" className="font-semibold">
                {state.name || "—"}
              </Text>
              {state.description && (
                <Text variant="xs" muted className="mt-0.5 line-clamp-2">
                  {state.description}
                </Text>
              )}
              <Text variant="sm" className="font-bold mt-1 text-primary">
                {state.basePrice > 0 ? formatPrice(state.basePrice) : "—"}
              </Text>
            </div>
          </div>

          {/* Steps */}
          {state.steps.length > 0 && (
            <div className="flex flex-col gap-3">
              {state.steps.map((step) => (
                <div key={step.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Text variant="xs" className="font-semibold">
                      {step.name || "Etapa sem nome"}
                    </Text>
                    {step.isRequired ? (
                      <Badge variant="destructive">Obrigatório</Badge>
                    ) : (
                      <Badge variant="secondary">Opcional</Badge>
                    )}
                  </div>
                  <Text variant="xs" muted>
                    {getStepPreviewLabel(step)}
                  </Text>
                  {step.options.length > 0 && (
                    <div className="flex flex-col gap-1 pl-2 border-l border-border">
                      {step.options.slice(0, 4).map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between">
                          <Text variant="xs">{opt.name || "—"}</Text>
                          {opt.priceDelta > 0 && (
                            <Text variant="xs" muted>
                              +{formatPrice(opt.priceDelta)}
                            </Text>
                          )}
                        </div>
                      ))}
                      {step.options.length > 4 && (
                        <Text variant="xs" muted className="italic">
                          +{step.options.length - 4} mais…
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
