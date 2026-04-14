"use client";

import * as React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/primitives/bottom-sheet/BottomSheet";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { useCart, type CartItem } from "./CartProvider";
import { useCreateOrder } from "@/features/guest/hooks";

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ── Cart item row ─────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <Text variant="sm" className="font-medium leading-snug">
          {item.name}
        </Text>
        {item.selectedModifiers.length > 0 && (
          <Text variant="xs" muted className="mt-0.5 leading-snug">
            {item.selectedModifiers.map((m) => m.optionName).join(", ")}
          </Text>
        )}
        <Text variant="sm" className="mt-1 font-semibold text-primary">
          {fmtPrice(item.finalPrice * item.quantity)}
        </Text>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() =>
            item.quantity === 1
              ? removeItem(item.cartId)
              : updateQuantity(item.cartId, item.quantity - 1)
          }
          className="flex size-7 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
          aria-label="Diminuir quantidade"
        >
          {item.quantity === 1 ? <Trash2 size={12} className="text-destructive" /> : <Minus size={12} />}
        </button>
        <Text variant="sm" className="w-4 text-center font-semibold tabular-nums">
          {item.quantity}
        </Text>
        <button
          type="button"
          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
          className="flex size-7 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
          aria-label="Aumentar quantidade"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalCents, clear } = useCart();
  const createOrder = useCreateOrder();

  const [success, setSuccess] = React.useState(false);

  const handlePlaceOrder = async () => {
    try {
      await createOrder.mutateAsync({
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers.map((m) => ({
            groupId: m.groupId,
            optionId: m.optionId,
          })),
          notes: item.notes || undefined,
        })),
      });
      setSuccess(true);
      clear();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Meu carrinho">
      {success ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-10 text-center">
          <Text variant="lg" className="font-bold text-success">
            Pedido enviado!
          </Text>
          <Text variant="sm" muted>
            Acompanhe o status na tela da mesa.
          </Text>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="px-5">
            {items.map((item) => (
              <CartItemRow key={item.cartId} item={item} />
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-border bg-background px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Text variant="sm" muted>
                Total
              </Text>
              <Text variant="sm" className="font-bold">
                {fmtPrice(totalCents)}
              </Text>
            </div>
            <Button
              onClick={handlePlaceOrder}
              loading={createOrder.isPending}
              disabled={items.length === 0}
              className="w-full"
            >
              Fazer pedido
            </Button>
            {createOrder.isError && (
              <Text variant="xs" className="text-destructive text-center">
                Erro ao enviar pedido. Tente novamente.
              </Text>
            )}
          </div>
        </>
      )}
    </BottomSheet>
  );
}
