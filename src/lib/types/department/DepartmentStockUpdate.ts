export interface DepartmentStockIssueUpdateType {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  averageCost?: number;
 newPurchaseUnitCost: number,
  quantity?: number;

  quantityChange?: number;
   
  newCurrentStock?: number;

  newAverageCost?: number;
  newStockValue?: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  purchaseMappings?: {
    purchaseUnit: string;
    consumptionUnit: string;
    factor: number;
  }[];
  beforeStock?: number;
  afterStock?: number;
}


export interface DepartmentStockReturnUpdateType {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  averageCost?: number;
 
  quantity?: number;

  quantityChange?: number;
   
  newCurrentStock?: number;

  
purchaseUnitCostDpt:number;
  purchaseUnitDpt: string;
  consumptionUnitDpt: string;
  conversionFactorDpt: number;

  purchaseMappings?: {
    purchaseUnit: string;
    consumptionUnit: string;
    factor: number;
  }[];
  beforeStock?: number;
  afterStock?: number;
}


export interface DepartmentStockUpdate {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;
newCurrentStock?: number;
  averageCost?: number;
 newPurchaseUnitCost: number,
  quantity?: number;

  quantityChange?: number;
  currentQuantity?: number;
  newQuantity?: number;

  newAverageCost?: number;
  newStockValue?: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
afterStock?: number;
  purchaseMappings?: {
    purchaseUnit: string;
    consumptionUnit: string;
    factor: number;
  }[];
}