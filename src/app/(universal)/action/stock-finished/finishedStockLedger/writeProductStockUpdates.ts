"use server";

import admin from "firebase-admin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { applyFinishedTransactionsRead } from "./applyFinishedTransactionsRead";

type ApplyFinishedMovementType = {
  productId: string;
  productName?: string;
  batchId: string;
  type: string;
  direction: "IN" | "OUT";

  quantity: number;
  transactionUnit: InventoryUnit;
  avgCostPerUnitProduct: number;
  unitPrice?: number;

  customerId?: string;
  customerName?: string;

  totalAmount?: number;
  totalRawCost?: number;
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

export async function writeProductStockUpdates(
  tx: FirebaseFirestore.Transaction,
  {
    productId,
    productName,
    type,
    direction,

    quantity,
    transactionUnit,

    avgCostPerUnitProduct,
    unitPrice = 0,

    customerId,
    customerName,

    totalRawCost,

    paidAmount = 0,
    dueAmount = 0,

    paymentStatus = "PAID",
    paymentMethod = null,

    referenceType = "MANUAL",
    referenceId = "",

    note = "",
    createdBy = "system",

    source = "SYSTEM",

    readResult,
  }: ApplyFinishedMovementType & {
    readResult: Awaited<
      ReturnType<typeof applyFinishedTransactionsRead>
    >;
  }
) {
  const now =
    admin.firestore.FieldValue.serverTimestamp();

  const {
    productRef,
    currentStock,
    avgCost,
  } = readResult;

  // ==========================
  // STOCK CALCULATIONS
  // ==========================

  const afterStock = currentStock + quantity;

  const existingStockValue =
    currentStock * avgCost;

  const incomingStockValue =
    quantity * avgCostPerUnitProduct;

  const afterStockValue =
    existingStockValue + incomingStockValue;

  const afterAverageCost =
    afterStockValue / afterStock;

  // ==========================
  // UPDATE PRODUCT
  // ==========================

  tx.update(productRef, {
    currentStock: afterStock,

    stockValue: Number(
      afterStockValue.toFixed(2)
    ),

    avgCost: Number(
      afterAverageCost.toFixed(2)
    ),

    costPrice: Number(
      afterAverageCost.toFixed(6)
    ),

    stockStatus:
      afterStock > 0
        ? "in_stock"
        : "out_of_stock",

    updatedAt: now,
  });
}