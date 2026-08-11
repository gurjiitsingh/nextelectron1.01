export interface RawInventoryUpdatenNew {
  ref: FirebaseFirestore.DocumentReference;

  inventoryItemId: string;
  inventoryItemName: string;

  // Quantity
  sendQty: number;

  // Units
  purchaseUnit: string;
  transactionUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  // Cost
  averageCost?:number;
 averageCostDpt?:number;
  purchaseUnitCost: number; 


  // Stock
  
  currentStock: number;
  beforeStock: number;
  afterStock: number;
  prev: number;
  next: number;
}

export interface RawInventoryUpdate {
  ref: FirebaseFirestore.DocumentReference;

  inventoryItemId: string;
  inventoryItemName: string;

  // Quantity
  sendQty: number;

  // Units
  purchaseUnit: string;
  transactionUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  // Cost
  storeAvgCost: number;
  unitCost: number;
  dptAvgCost: number;
  storeStockValue: number;
  purchaseUnitCost: number;

  // Stock
  storeStock: number;
  currentStock: number;
  beforeStock: number;
  afterStock: number;
  prev: number;
  next: number;
}