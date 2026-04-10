"use client";

import { useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";

export default function EditProductPage() {
  const { context } = useActiveContext();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  const menuId = searchParams.get("menuId");

  if (context.type !== "restaurant") {
    return <Text variant="sm" muted>Selecione um restaurante.</Text>;
  }

  if (!categoryId || !menuId) {
    return <Text variant="sm" muted>Parâmetros inválidos.</Text>;
  }

  // TODO: implementar edição quando o endpoint PATCH /items/:id retornar o produto completo com steps
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Text variant="h2">Edição de produto</Text>
      <Text variant="sm" muted>Em desenvolvimento.</Text>
    </div>
  );
}
