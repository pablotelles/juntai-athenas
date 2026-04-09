export interface Table {
  id: string;
  restaurantId: string;
  locationId: string;
  label: string;
  qrCodeToken: string;
  capacity: number | null;
  isActive: boolean;
}
