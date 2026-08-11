export type LoadVehicleFormType = {
  vehicleId: string;

  remarks?: string;

  items: {
    productId: string;
    quantity: number;
  }[];
};