import { InventoryUnit } from "@/lib/types/InventoryItemType";

export type ProductionBatchItemType = {
  id: string;

  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;

  purchaseUnit: InventoryUnit | string;
  consumptionUnit: InventoryUnit | string;
  conversionFactor: number;

  averageCost: number;
  costPerUnit: number;
  itemTotalCost: number;
};