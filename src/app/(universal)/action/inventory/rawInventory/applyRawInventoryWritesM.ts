"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function applyRawInventoryWritesM(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  referenceId: string,
  direction: "IN" | "OUT" = "OUT"
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  let totalValue = 0;

  for (const u of updates) {
    const quantity = Number(u.quantity || 0);
    const unitCost = Number(u.unitCost || 0);
    const stockValue = Number(u.stockValue || 0);

    const movementValue = quantity * unitCost;

    totalValue += movementValue;

    const beforeStock = Number(u.prev);

    const afterStock =
      direction === "OUT"
        ? beforeStock - quantity
        : beforeStock + quantity;

    const afterStockValue =
      direction === "OUT"
        ? Math.max(0, stockValue - movementValue)
        : stockValue + movementValue;

    // =====================================
    // Inventory
    // =====================================

    tx.update(u.ref, {
      currentStock: afterStock,
      stockValue: Number(
        afterStockValue.toFixed(2)
      ),
      updatedAt: now,
    });

    // =====================================
    // Ledger
    // =====================================

    const ledgerRef =
      adminDb
        .collection("stockLedgerInventory")
        .doc();

    tx.set(ledgerRef, {
      transactionId: ledgerRef.id,

      inventoryItemId: u.inventoryItemId,
      inventoryItemName: u.itemName,

      supplierId: "",
      supplierName: "",

      type:
        direction === "OUT"
          ? "CONSUMPTION"
          : "RETURN",

      direction,

      purchaseQuantity: 0,
      purchaseUnit: u.purchaseUnit || "",
      purchaseUnitCost: 0,

      conversionFactor:
        u.conversionFactor,

      quantity,
      unit: u.transactionUnit,

      unitCost,

      beforeStock,
      afterStock,

      totalAmount: Number(
        movementValue.toFixed(2)
      ),

      paidAmount: 0,
      dueAmount: 0,
      paymentStatus: null,
      paymentMethod: null,

      referenceType:
        direction === "OUT"
          ? "PRODUCTION"
          : "RETURN_TO_MAIN_STORE",

      referenceId,

      note:
        direction === "OUT"
          ? "Consumed in production"
          : "Returned from department",

      createdBy: "system",

      source:
        direction === "OUT"
          ? "PRODUCTION"
          : "DEPARTMENT_RETURN",

      createdAt: now,
    });
  }

  return Number(totalValue.toFixed(2));
}