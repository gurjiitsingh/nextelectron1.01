export interface departmentStockTransactionInput {
  transaction?: FirebaseFirestore.Transaction;

  departmentId: string;
  departmentName: string;

  transferId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  averageCost: number;
  costPerUnit: number;
  totalCost: number;
  type: string,
  direction: string,

  referenceType: string,

  createdAt: Date;
}