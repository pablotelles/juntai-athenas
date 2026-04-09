import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Relatórios</Text>
        <Text variant="sm" muted className="mt-1">
          Análises e exportações de dados.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Permitirá gerar e exportar relatórios de
        desempenho, vendas e operação.
      </Text>
    </div>
  );
}
