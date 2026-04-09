import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Dashboard</Text>
        <Text variant="sm" muted className="mt-1">
          Visão geral — os dados são filtrados pelo contexto ativo.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. O conteúdo será diferente para cada
        contexto (platform, group, restaurant).
      </Text>
    </div>
  );
}
