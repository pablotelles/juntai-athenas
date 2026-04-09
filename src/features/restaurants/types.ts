export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
}

export interface LocationAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface Location {
  id: string;
  restaurantId: string;
  name: string;
  address: LocationAddress;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}
