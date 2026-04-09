import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Configurações</Text>
        <Text variant="sm" muted className="mt-1">
          Preferências da conta e do sistema.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Gerenciará configurações de perfil,
        notificações, integrações e preferências do sistema.
      </Text>
    </div>
  );
}
