import { Header } from "@/components/compositions/header/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/card/Card";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import {
  ShoppingBag,
  CreditCard,
  Star,
  Clock,
} from "lucide-react";

const stats = [
  {
    label: "Pedidos hoje",
    value: "47",
    change: "12 pendentes",
    icon: ShoppingBag,
    badgeVariant: "warning" as const,
  },
  {
    label: "Faturamento hoje",
    value: "R$ 3.240",
    change: "+15% vs ontem",
    icon: CreditCard,
    badgeVariant: "success" as const,
  },
  {
    label: "Avaliação média",
    value: "4,8",
    change: "Baseado em 312 avaliações",
    icon: Star,
    badgeVariant: "info" as const,
  },
  {
    label: "Tempo médio",
    value: "28 min",
    change: "Entrega realizada",
    icon: Clock,
    badgeVariant: "secondary" as const,
  },
];

const recentOrders = [
  { id: "#1042", customer: "Mesa 4", items: "2x Pizza, 1x Suco", status: "preparing" },
  { id: "#1041", customer: "Delivery", items: "1x X-Burguer, 2x Batata", status: "ready" },
  { id: "#1040", customer: "Mesa 7", items: "3x Temaki, 2x Refrigerante", status: "delivered" },
  { id: "#1039", customer: "Delivery", items: "1x Combo Família", status: "delivered" },
];

const statusMap: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" }> = {
  preparing: { label: "Preparando", variant: "warning" },
  ready: { label: "Pronto", variant: "info" },
  delivered: { label: "Entregue", variant: "success" },
};

export default function RestaurantDashboardPage() {
  return (
    <>
      <Header
        title="Dashboard Restaurante"
        description="Cantina do Paulo — visão geral do dia"
        actions={
          <Badge variant="success" dot>
            Restaurante aberto
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

        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Text variant="body" className="font-medium">
                        {order.id}
                      </Text>
                      <Text variant="sm" muted>
                        {order.customer}
                      </Text>
                    </div>
                    <Text variant="xs" muted>
                      {order.items}
                    </Text>
                  </div>
                  <Badge variant={statusMap[order.status].variant}>
                    {statusMap[order.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
