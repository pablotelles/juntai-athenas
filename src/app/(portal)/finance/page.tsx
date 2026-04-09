import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function FinancePage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Financeiro</Text>
        <Text variant="sm" muted className="mt-1">
          Receitas, despesas, repasses e relatórios financeiros.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Exibirá dados financeiros agregados de
        acordo com o contexto ativo (plataforma, grupo ou restaurante).
      </Text>
    </div>
  );
}
