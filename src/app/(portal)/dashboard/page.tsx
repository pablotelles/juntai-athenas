"use client";

import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  getPortalProfileLabel,
  resolvePortalProfile,
  type PortalProfile,
} from "@/lib/access";

const DASHBOARD_COPY: Record<
  PortalProfile,
  {
    title: string;
    description: string;
    highlights: string[];
  }
> = {
  "platform-admin": {
    title: "Painel da plataforma",
    description:
      "Acompanhe a expansão da operação, cadastre restaurantes e dê suporte aos owners.",
    highlights: [
      "Cadastrar novos restaurantes",
      "Acompanhar unidades ativas e crescimento",
      "Gerir usuários e governança da plataforma",
    ],
  },
  owner: {
    title: "Painel do proprietário",
    description:
      "Gerencie as unidades da operação e acompanhe o que cada filial precisa para começar a vender.",
    highlights: [
      "Criar e organizar filiais",
      "Acompanhar cardápio, mesas e pedidos por unidade",
      "Configurar a base operacional do restaurante",
    ],
  },
  operator: {
    title: "Painel operacional",
    description:
      "Use a mesma visão do owner para acompanhar a operação, com foco em execução diária.",
    highlights: [
      "Consultar filiais e contexto ativo",
      "Acompanhar pedidos, mesas e cardápio",
      "Operar a rotina do restaurante com segurança",
    ],
  },
  "basic-user": {
    title: "Área do usuário",
    description:
      "Seu portal operacional ainda está em preparação. Em breve você verá suas ações e atalhos aqui.",
    highlights: [
      "Placeholder inicial do dashboard",
      "Sem menus operacionais liberados por enquanto",
      "Estrutura pronta para expansão futura",
    ],
  },
};

export default function DashboardPage() {
  const { context } = useActiveContext();
  const { memberships } = useAuth();
  const profile = resolvePortalProfile(memberships, context.type);
  const copy = DASHBOARD_COPY[profile];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Text variant="h2">{copy.title}</Text>
        <Text variant="sm" muted className="mt-1">
          {copy.description}
        </Text>
      </div>

      <ActiveContextBanner />

      <div className="grid gap-4 md:grid-cols-3">
        {copy.highlights.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
          >
            <Text variant="sm" className="font-semibold">
              {item}
            </Text>
            <Text variant="xs" muted className="mt-2 block">
              Perfil ativo: {getPortalProfileLabel(profile)}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
