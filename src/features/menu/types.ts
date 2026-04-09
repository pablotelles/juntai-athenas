export interface ModifierOption {
  id: string;
  modifierGroupId: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ModifierGroup {
  id: string;
  restaurantId: string;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  createdAt: string;
  modifierGroups: ModifierGroup[];
}

export interface Category {
  id: string;
  menuId: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  items: MenuItem[];
}

export interface MenuWithCategories {
  id: string;
  restaurantId: string;
  locationId: string | null;
  name: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  categories: Category[];
}
