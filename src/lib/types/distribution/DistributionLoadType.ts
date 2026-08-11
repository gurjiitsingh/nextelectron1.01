export type DistributionLoadType = {
  id: string;

  tripId: string;

  productId: string;
  productName: string;

  quantity: number;
  unit: string;

  loadedAt: number;
  loadedBy: string;
};