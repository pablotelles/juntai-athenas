"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { getStepPreviewLabel, type BuilderState } from "../../builder";

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PreviewPanelProps {
  state: BuilderState;
  className?: string;
}

export function PreviewPanel({ state, className }: PreviewPanelProps) {
  const hasInfo = !!state.name || state.basePrice > 0;

  return (
    <aside className={cn("flex flex-col bg-muted/30 border-t border-border lg:h-full lg:border-t-0 lg:border-l", className)}>
      {/* Title bar */}
      <div className="px-4 py-4 sm:px-5 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Preview do cliente
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasInfo ? (
          <div className="flex items-center justify-center h-40 px-6">
            <p className="text-sm text-muted-foreground text-center italic">
              Preencha o nome e o preço para ver o preview.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Product card */}
            <div className="p-4 sm:p-5 border-b border-border">
              <div className="flex gap-3 items-start">
                {state.imageUrl ? (
                  <img
                    src={state.imageUrl}
                    alt={state.name}
                    className="h-20 w-20 rounded-xl object-cover bg-secondary shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-secondary shrink-0 flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 flex flex-col gap-0.5">
                  <p className="font-semibold text-base leading-tight">
                    {state.name || "—"}
                  </p>
                  {state.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {state.description}
                    </p>
                  )}
                  <p className="text-base font-bold text-primary mt-1">
                    {state.basePrice > 0 ? fmt(state.basePrice) : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            {state.steps.map((step) => {
              const instruction = getStepPreviewLabel(step);
              const isChoice = step.stepType === "choice";
              const isQuantity = step.stepType === "quantity";

              return (
                <div key={step.id} className="border-b border-border">
                  {/* Step header */}
                  <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-2 gap-3">
                    <div>
                      <p className="font-semibold text-sm">
                        {step.name || "Etapa sem nome"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {instruction}
                      </p>
                    </div>
                    {step.isRequired ? (
                      <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full shrink-0">
                        Obrigatório
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">
                        Opcional
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="flex flex-col px-4 sm:px-5 pb-4 gap-1">
                    {step.options.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Nenhuma opção adicionada.
                      </p>
                    )}
                    {step.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between gap-3 py-1.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isChoice ? (
                            <span className="h-4 w-4 rounded-full border-2 border-border bg-background shrink-0" />
                          ) : isQuantity ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="h-6 w-6 rounded border border-border bg-background text-xs flex items-center justify-center text-muted-foreground">
                                −
                              </span>
                              <span className="text-xs w-4 text-center">0</span>
                              <span className="h-6 w-6 rounded border border-border bg-background text-xs flex items-center justify-center text-primary font-bold">
                                +
                              </span>
                            </div>
                          ) : (
                            <span className="h-4 w-4 rounded border-2 border-border bg-background shrink-0" />
                          )}
                          {opt.imageUrl ? (
                            <img
                              src={opt.imageUrl}
                              alt={opt.name || "Opção"}
                              className="h-9 w-9 rounded-md object-cover bg-secondary shrink-0"
                            />
                          ) : null}
                          <span className="text-sm truncate">
                            {opt.name || "—"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {isQuantity && opt.unitPrice
                            ? fmt(opt.unitPrice) + "/un."
                            : opt.priceDelta > 0
                              ? "+" + fmt(opt.priceDelta)
                              : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add to cart button */}
            {hasInfo && (
              <div className="p-4 sm:p-5">
                <div className="w-full rounded-xl bg-primary/90 text-primary-foreground text-sm font-semibold py-3 text-center opacity-60 select-none">
                  Adicionar ao pedido
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
