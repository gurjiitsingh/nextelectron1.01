export interface RawInventoryUpdateDptReturnType {
  ref: FirebaseFirestore.DocumentReference;

  inventoryItemId: string;
  inventoryItemName: string; 

  // Value From Form
  sendQty: number;
  averageCostDpt: number;
   purchaseUnitDpt: string;
  purchaseUnitCostDpt:number;
  conversionFactorDpt: number;
  // Units

  transactionUnit: string;
  consumptionUnit: string;
 
  averageCost: number;
  currentStock: number;
  currentStockValue: number;
  purchaseUnit: string;
  purchaseUnitCost: number;
  conversionFactor:number;

    
  beforeStock: number;
  afterStock: number;
  prev: number;
  next: number;
}