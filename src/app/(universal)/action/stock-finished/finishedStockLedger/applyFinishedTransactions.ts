"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";

import { InventoryUnit } from "@/lib/types/InventoryItemType";

type ApplyFinishedMovementType = {
  productId: string;
productName?: string;
  type: string;
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;

  unitPrice?: number;

  customerId?: string;
  customerName?: string;

  totalAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
returnProductAmount?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;

  source?: string;
};

export async function applyFinishedTransactions( 
  tx: FirebaseFirestore.Transaction, // ✅ pass tx explicitly
  {
    productId,
    productName,

    type,
    direction,

    quantity,
    transactionUnit,

    unitPrice,

    customerId,
    customerName,

    totalAmount = 0,
    returnProductAmount =0, 
    paidAmount = 0,
    dueAmount = 0,

    paymentStatus = "PAID",
    paymentMethod = null,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",

    source = "SYSTEM",
  }: ApplyFinishedMovementType
) {

  // USED BY NEW PRODUCTION AND CUSTOMER RETURN

  const now = admin.firestore.FieldValue.serverTimestamp();

  const productRef = adminDb.collection("productStock").doc(productId);

  // ✅ READ (allowed here because still in READ phase of main flow)
  const snap = await tx.get(productRef);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const product = snap.data()!;

  const beforeStock = Number(product.currentStock) || 0;

  const beforeStockValue =
  Number(product.stockValue) || 0;

const beforeAverageCost =
  Number(product.averageCost) || 0;

const beforeCostPrice =
  Number(product.costPrice) || 0;

  const afterStock =
    direction === "IN"
      ? beforeStock + quantity
      : beforeStock - quantity;

  if (
    direction === "OUT" &&
    afterStock < 0 &&
    !product.allowNegativeStock
  ) {
    throw new Error("Insufficient stock");
  }

  // const finalUnitPrice =
  //   unitPrice ?? Number(product.price) ?? 0;

const movementUnitCost =
  Number(unitPrice ?? beforeAverageCost);

let afterStockValue = beforeStockValue;
let afterAverageCost = beforeAverageCost;
let afterCostPrice = beforeCostPrice;

if (direction === "IN") {
  afterStockValue =
    beforeStockValue + totalAmount;

  afterAverageCost =
    afterStock > 0
      ? afterStockValue / afterStock
      : 0;

  // Latest production cost
  afterCostPrice = movementUnitCost;
} else {
  const removedValue =
    quantity * beforeAverageCost;

  afterStockValue = Math.max(
    0,
    beforeStockValue - removedValue
  );

  afterAverageCost =
    afterStock > 0
      ? afterStockValue / afterStock
      : 0;

  // Last production cost remains unchanged
}


  // ✅ WRITE
tx.update(productRef, {
  currentStock: afterStock,

  stockValue: Number(
    afterStockValue.toFixed(2)
  ),

  averageCost: Number(
    afterAverageCost.toFixed(6)
  ),

  costPrice: Number(
    afterCostPrice.toFixed(6)
  ),

  stockStatus:
    afterStock > 0
      ? "in_stock"
      : "out_of_stock",

  updatedAt: now,
});

  const ledgerRef =
    adminDb.collection("stockLedgerFinished").doc();

  tx.set(ledgerRef, {
    transactionId: ledgerRef.id,

    productId,
    productName: product.name || "",

    type,
    direction,

    quantity,
    transactionUnit,

    unitPrice: movementUnitCost,
    productSnapshotPrice: Number(product.price) || 0,
    totalAmount,

    beforeStock,
    afterStock,

    customerId: customerId || "",
    customerName: customerName || "",

    paidAmount,
    dueAmount,

    paymentStatus,
    paymentMethod,

    referenceType,
    referenceId,

    note,
    createdBy,

    createdAt: now,
    source,
  });

 return {
  transactionId: ledgerRef.id,

  beforeStock,
  afterStock,

  unitPrice: movementUnitCost,

  averageCost: afterAverageCost,

  stockValue: afterStockValue,
}; 
}