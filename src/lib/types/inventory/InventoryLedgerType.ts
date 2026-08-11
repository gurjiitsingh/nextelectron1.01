import admin from "firebase-admin";

export interface InventoryLedgerType {
  // =====================================================
  // DOCUMENT
  // =====================================================
  transactionId: string;

  // =====================================================
  // INVENTORY ITEM
  // =====================================================
  inventoryItemId: string;
  inventoryItemName: string;

  // =====================================================
  // PARTY (NEW)
  // Replaces:
  // supplierId
  // supplierName
  //
  // Can represent Supplier, Department, Employee,
  // Customer, System, etc.
  // =====================================================
  partyId: string;
  partyName: string;
  partyType:
    | "SUPPLIER"
    | "DEPARTMENT"
    | "EMPLOYEE"
    | "CUSTOMER"
    | "SYSTEM";

  // =====================================================
  // PURCHASE DETAILS
  // Used when stock is purchased.
  // Can remain 0 for production/adjustments.
  // =====================================================
  purchaseQuantity: number;
  purchaseUnit: string;
  purchaseUnitCost: number;
quantity?:number;
consumptionUnit?:string;
 unitCost?: number;
 transactionAmount?: number;
  // =====================================================
  // TRANSACTION DETAILS
  // RENAMED
  //
  // quantity      -> transactionQuantity
  // consumptionUnit -> transactionUnit
  // unitCost      -> transactionUnitCost
  //
  // These fields always describe the
  // actual stock movement.
  // =====================================================
  transactionQuantity: number;
  transactionUnit: string;
  transactionUnitCost: number;

  conversionFactor: number;

  // =====================================================
  // STOCK
  // =====================================================
  beforeStock: number;
  afterStock: number;

  // =====================================================
  // VALUE
  // =====================================================
  totalAmount: number;

  // =====================================================
  // PAYMENT
  // =====================================================
  paidAmount?: number;
  dueAmount?: number;

  paymentStatus?: string | null;
  paymentMethod?: string | null;

  // =====================================================
  // TRANSACTION INFO
  // =====================================================
  referenceType: string;

  type:
  | "PURCHASE"
  | "PRODUCTION_CONSUMPTION"
  | "PRODUCTION_OUTPUT"
  | "STOCK_TRANSFER"
  | "STOCK_RETURN"
  | "ADJUSTMENT"
  | "WASTAGE"
  | "OPENING_STOCK"
  | string;

  direction: "IN" | "OUT";

  note: string;

  // =====================================================
  // SOURCE
  // RENAMED
  //
  // source -> sourceModule
  // Makes it clear this came from another module.
  // =====================================================
  sourceModule: string;

  referenceId: string;

  // =====================================================
  // CREATED
  // RENAMED
  //
  // createdBy -> createdById
  //
  // Optional:
  // createdByName
  // =====================================================
  createdById: string;
  createdByName?: string;

 // createdAt: Date | FirebaseFirestore.Timestamp;
  createdAt:
    | admin.firestore.Timestamp
    | admin.firestore.FieldValue
    | Date;
}