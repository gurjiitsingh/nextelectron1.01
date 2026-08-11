"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
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

export async function writeProductStockTransactions(
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

  const incomingStockValue =
    quantity * avgCostPerUnitProduct;

  // ==========================
  // UPDATE PRODUCT
  // ==========================
 
  
  const ledgerRef =
    adminDb.collection("stockLedgerFinished").doc();

  tx.set(ledgerRef, {


    transactionId: ledgerRef.id,
    productId,
    productName: productName,
    type,
    direction,
    quantity,
    totalAmount:incomingStockValue,
    transactionUnit,
    unitPrice,
    beforeStock:currentStock,
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



}




















// tx.set(ledgerRef, {
//   transactionId: ledgerRef.id,

//   productId,
//   productName,

//   type,
//   direction,

//   quantity,
//   transactionUnit,

//   unitPrice,

//   beforeStock: currentStock,
//   afterStock,

//   beforeAverageCost: avgCost,
//   incomingAverageCost: avgCostPerUnitProduct,
//   afterAverageCost: Number(afterAverageCost.toFixed(6)),

//   beforeStockValue: Number(existingStockValue.toFixed(2)),
//   transactionStockValue: Number(incomingStockValue.toFixed(2)),
//   afterStockValue: Number(afterStockValue.toFixed(2)),

//   customerId: customerId || "",
//   customerName: customerName || "",

//   totalRawCost: totalRawCost ?? 0,

//   paidAmount,
//   dueAmount,

//   paymentStatus,
//   paymentMethod,

//   referenceType,
//   referenceId,

//   note,
//   createdBy,
//   source,

//   createdAt: now,
// });