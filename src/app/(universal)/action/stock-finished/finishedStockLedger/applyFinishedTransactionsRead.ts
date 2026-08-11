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

export async function applyFinishedTransactionsRead(
  tx: FirebaseFirestore.Transaction,
  productId: string
) {
  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const snap = await tx.get(productRef);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const product = snap.data()!;

  return {
    productRef,
    product,

    currentStock:
      Number(product.currentStock) || 0,

    stockValue:
      Number(product.stockValue) || 0,

    avgCost:
      Number(product.avgCost) || 0,

    costPrice:
      Number(product.costPrice) || 0,

    allowNegativeStock:
      Boolean(product.allowNegativeStock),

    sellingPrice:
      Number(product.price) || 0,
  };
}