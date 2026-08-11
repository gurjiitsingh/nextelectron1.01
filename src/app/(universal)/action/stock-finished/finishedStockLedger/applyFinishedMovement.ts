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

  paymentStatus?: string;
  paymentMethod?: string | null;

  referenceType?: string;
  referenceId?: string;

  note?: string;
  createdBy?: string;

  source?: string;
};

export async function applyFinishedMovement(
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
  const now = admin.firestore.FieldValue.serverTimestamp();

  const productRef = adminDb.collection("products").doc(productId);

  // ✅ READ (allowed here because still in READ phase of main flow)
  const snap = await tx.get(productRef);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const product = snap.data()!;

  const beforeStock = Number(product.currentStock) || 0;

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

  const finalUnitPrice =
    unitPrice ?? Number(product.price) ?? 0;

  // ✅ WRITE
  tx.update(productRef, {
    currentStock: afterStock,
    stockStatus: afterStock > 0 ? "in_stock" : "out_of_stock",
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

    unitPrice: finalUnitPrice,
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
    transactionId: ledgerRef.id, // ✅ IMPORTANT (you need this)
    beforeStock,
    afterStock,
    unitPrice: finalUnitPrice,
  };
}