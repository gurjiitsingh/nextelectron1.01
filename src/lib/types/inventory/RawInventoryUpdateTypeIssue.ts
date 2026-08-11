export interface RawInventoryUpdateIssue {
  ref: FirebaseFirestore.DocumentReference;

  // Inventory
  inventoryItemId: string;
  inventoryItemName: string;

  // Quantity
  quantity: number;

  // Units
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  // Cost
  averageCost: number;

  // Stock
  beforeStock: number;
  afterStock: number;

  // Navigation
  // prev: number;
  // next: number;
}