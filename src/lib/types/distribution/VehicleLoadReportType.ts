export type VehicleLoadReport = {
  loadId: string;
  loadNo?: string;

  tripId: string;

  vehicleId: string;
  vehicleName: string;

  driverId?: string;
  driverName?: string;

  routeId?: string;
  routeName?: string;

  locationCode?: string;
  responsiblePerson?: string;

  totalItems: number;
  totalQuantity: number;
  totalValue: number;

  status:
    | "DRAFT"
    | "LOADED"
    | "IN_ROUTE"
    | "RETURNED"
    | "SETTLED"
    | "CANCELLED";

  remarks?: string;
  createdBy?: string;

  createdAt?: Date;
};