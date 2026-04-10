"use client";

import * as React from "react";
import {
  Trash2,
  Plus,
  Link,
  Link2Off,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { Combobox } from "@/components/shared/combobox/Combobox";
import { Tooltip } from "@/components/shared/tooltip/Tooltip";
import { cn } from "@/lib/cn";
import type { BuilderOption } from "../../builder";
import type { StepType, MenuItem } from "@juntai/types";

interface OptionItemProps {
  option: BuilderOption;
  stepType: StepType;
  isChild?: boolean;
  allItems: MenuItem[];
  onChange: (id: string, patch: Partial<BuilderOption>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function OptionItem({
  option,
  stepType,
  isChild = false,
  allItems,
  onChange,
  onRemove,
  onAddChild,
}: OptionItemProps) {
  const isQuantity = stepType === "quantity";
  const isComposition = stepType === "composition";
  const isLinked = !!option.linkedItemId;
  const [extraOpen, setExtraOpen] = React.useState(
    !!(option.imageUrl || option.description),
  );

  const comboboxOptions = allItems.map((item) => ({
    value: item.id,
    label: item.name,
    description: item.description ?? undefined,
    image: item.imageUrl ?? "",
  }));

  const handleSelectItem = (itemId: string) => {
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;
    onChange(option.id, {
      linkedItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl ?? "",
      description: item.description ?? "",
    });
  };

  const handleUnlink = () => {
    onChange(option.id, { linkedItemId: null });
  };

  const linkHelpContent = (
    <div className="max-w-xs space-y-2 text-left leading-relaxed">
      <p className="font-semibold">Como funciona a vinculação</p>
      <p>
        <strong>Vinculação:</strong> esta opção reaproveita um produto já
        cadastrado no catálogo.
      </p>
      <p>
        <strong>Relação:</strong> nome, imagem e descrição acompanham o produto
        vinculado.
      </p>
      <p>
        <strong>Limites e preço:</strong> acréscimo, mínimo e máximo continuam
        sendo configurados aqui nesta etapa.
      </p>
    </div>
  );

  // ── Child options: compact, sem picker ─────────────────────────────────────
  if (isChild) {
    return (
      <div className="flex flex-col gap-2 ml-5 pl-4 border-l-2 border-border">
        <div className="flex items-center gap-2">
          <Input
            value={option.name}
            onChange={(e) => onChange(option.id, { name: e.target.value })}
            placeholder="Nome da sub-opção"
            className="flex-1 h-9 text-sm"
          />
          {!isQuantity && (
            <div className="relative w-28">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                +R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={option.priceDelta || ""}
                onChange={(e) =>
                  onChange(option.id, {
                    priceDelta: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0,00"
                className="pl-9 h-9 text-sm"
                aria-label="Acréscimo de preço"
              />
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(option.id)}
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Remover sub-opção"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Root option ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: nome + preço + ações */}
      <div className="flex items-center gap-2">
        {/* Thumbnail quando vinculado */}
        {isLinked && option.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={option.imageUrl}
            alt={option.name}
            className="h-9 w-9 rounded-lg object-cover shrink-0 border border-border"
          />
        )}

        {/* Nome — bloqueado quando vinculado */}
        {isLinked ? (
          <div className="flex-1 flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-secondary/50 text-sm min-w-0 select-none">
            <span className="flex-1 truncate text-foreground">
              {option.name}
            </span>
            <Link className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
        ) : (
          <Input
            value={option.name}
            onChange={(e) => onChange(option.id, { name: e.target.value })}
            placeholder="Nome da opção"
            className="flex-1 h-9 text-sm"
          />
        )}

        {/* Preço */}
        {!isQuantity && (
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              +R$
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={option.priceDelta || ""}
              onChange={(e) =>
                onChange(option.id, {
                  priceDelta: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0,00"
              className="pl-9 h-9 text-sm"
              aria-label="Acréscimo de preço"
            />
          </div>
        )}

        {/* Sub-opção (composition) */}
        {isComposition && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAddChild(option.id)}
            aria-label="Adicionar sub-opção"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Remover */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(option.id)}
          className="text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Remover opção"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Row 2: vínculo */}
      {isLinked ? (
        <div className="flex items-center gap-3 pl-0.5">
          <Tooltip content={linkHelpContent}>
            <span className="text-xs text-primary flex items-center gap-1 cursor-help">
              <Link className="h-3 w-3" />
              Vinculado ao produto
            </span>
          </Tooltip>
          <Tooltip content="Remove a relação com o catálogo e mantém os dados atuais desta opção como cópia local.">
            <button
              type="button"
              onClick={handleUnlink}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <Link2Off className="h-3 w-3" />
              Desvincular
            </button>
          </Tooltip>
        </div>
      ) : (
        <Combobox
          options={comboboxOptions}
          value={undefined}
          onChange={handleSelectItem}
          placeholder="🔍  Buscar produto do catálogo (opcional)..."
          searchPlaceholder="Pesquisar produto..."
          emptyMessage="Nenhum produto encontrado."
        />
      )}

      {/* Row 3: campos extras (imageUrl + descrição) — só quando não vinculado */}
      {!isLinked && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setExtraOpen((v) => !v)}
            className={cn(
              "text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit transition-colors pl-0.5",
              (option.imageUrl || option.description) && "text-foreground",
            )}
          >
            {extraOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Imagem e descrição
          </button>
          {extraOpen && (
            <div className="flex flex-col gap-1.5 pl-0.5">
              <Input
                value={option.imageUrl}
                onChange={(e) =>
                  onChange(option.id, { imageUrl: e.target.value })
                }
                placeholder="URL da imagem (opcional)"
                className="h-8 text-xs"
              />
              <Input
                value={option.description}
                onChange={(e) =>
                  onChange(option.id, { description: e.target.value })
                }
                placeholder="Descrição (opcional)"
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* Campos de quantidade */}
      {isQuantity && (
        <div className="flex items-center gap-2 flex-wrap pl-0.5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Preço/unidade</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={option.unitPrice ?? ""}
              onChange={(e) =>
                onChange(option.id, {
                  unitPrice: parseFloat(e.target.value) || null,
                })
              }
              placeholder="R$ 0,00"
              className="w-28 h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Mínimo</span>
            <Input
              type="number"
              min="0"
              value={option.minQuantity}
              onChange={(e) =>
                onChange(option.id, {
                  minQuantity: parseInt(e.target.value) || 0,
                })
              }
              className="w-20 h-8 text-sm text-center"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Máximo</span>
            <Input
              type="number"
              min="1"
              value={option.maxQuantity ?? ""}
              onChange={(e) =>
                onChange(option.id, {
                  maxQuantity: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="∞"
              className="w-20 h-8 text-sm text-center"
            />
          </div>
        </div>
      )}

      {/* Sub-opções */}
      {option.childOptions.map((child) => (
        <OptionItem
          key={child.id}
          option={child}
          stepType={stepType}
          isChild
          allItems={allItems}
          onChange={onChange}
          onRemove={onRemove}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
