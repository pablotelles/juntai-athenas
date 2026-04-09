// ─────────────────────────────────────────────────────────────
// MOCK DATA
// Replace with real API calls in future phases.
// ─────────────────────────────────────────────────────────────

export interface Restaurant {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  restaurants: Restaurant[];
}

export const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "Grupo A",
    restaurants: [
      { id: "r1", name: "Restaurante 1" },
      { id: "r2", name: "Restaurante 2" },
    ],
  },
  {
    id: "g2",
    name: "Grupo B",
    restaurants: [
      { id: "r3", name: "Restaurante 3" },
      { id: "r4", name: "Restaurante 4" },
    ],
  },
];

export const ALL_RESTAURANTS: Restaurant[] = MOCK_GROUPS.flatMap(
  (g) => g.restaurants,
);

export function findRestaurant(id: string): Restaurant | undefined {
  return ALL_RESTAURANTS.find((r) => r.id === id);
}

export function findGroup(id: string): Group | undefined {
  return MOCK_GROUPS.find((g) => g.id === id);
}

export function findGroupOfRestaurant(restaurantId: string): Group | undefined {
  return MOCK_GROUPS.find((g) =>
    g.restaurants.some((r) => r.id === restaurantId),
  );
}
