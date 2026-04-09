import { Header } from "@/components/compositions/header/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card/Card";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import {
  UtensilsCrossed,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Restaurantes ativos",
    value: "142",
    change: "+8 este mês",
    trend: "up",
    icon: UtensilsCrossed,
  },
  {
    label: "Usuários cadastrados",
    value: "1.847",
    change: "+23 esta semana",
    trend: "up",
    icon: Users,
  },
  {
    label: "Receita do mês",
    value: "R$ 284.590",
    change: "+12% vs mês anterior",
    trend: "up",
    icon: CreditCard,
  },
  {
    label: "Crescimento",
    value: "18,4%",
    change: "Últimos 30 dias",
    trend: "up",
    icon: TrendingUp,
  },
];

export default function AdminDashboardPage() {
  return (
    <>
      <Header
        title="Dashboard Admin"
        description="Visão geral da plataforma Juntai"
        actions={
          <Badge variant="success" dot>
            Plataforma operacional
          </Badge>
        }
      />

      <div className="p-6 flex flex-col gap-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Text variant="h3">{stat.value}</Text>
                <Text variant="xs" muted className="mt-1">
                  {stat.change}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder content */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Restaurantes recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {["Cantina do Paulo", "Burguer Factory", "Sushi Zen"].map(
                  (name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <Text variant="body">{name}</Text>
                      <Badge variant="success">Ativo</Badge>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {["Ana Lima", "Carlos Souza", "Beatriz Costa"].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <Text variant="body">{name}</Text>
                    <Badge variant="secondary">Admin</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
