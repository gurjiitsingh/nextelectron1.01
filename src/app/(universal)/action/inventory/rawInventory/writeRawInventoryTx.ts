"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";


export async function writeRawInventoryTx(
  tx: FirebaseFirestore.Transaction,
  updates: any[],
  orderId: string,
  type: string,
  direction: "OUT" | "IN" = "OUT",
  note: string = "Consumed in production",
  createdBy: string = "system",
  source: string = "PRODUCTION",
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  
  let totalRawMaterialCost = 0;

  for (const u of updates) {
    // =====================================
    // Cost of this inventory item
    // =====================================

    const consumedValue =
      (Number(u.quantity) || 0) *
      (Number(u.unitCost) || 0);

    totalRawMaterialCost += consumedValue;

    const newStockValue = Math.max(
      0,
      (Number(u.stockValue) || 0) - consumedValue
    );

    // IT TAEK STOCK FROM DPT SO NO UPDATE
    // tx.update(u.ref, {
    //   currentStock: u.next,
    //   stockValue: Number(newStockValue.toFixed(2)),
    //   updatedAt: now,
    // });

    // =====================================
    // Ledger
    // =====================================

    const ledgerRef =
      adminDb.collection("stockLedgerInventory").doc();

    tx.set(ledgerRef, {
      transactionId: ledgerRef.id,

      inventoryItemId: u.inventoryItemId,
      inventoryItemName: u.inventoryItemName,

      supplierId: "",
      supplierName: "",



      purchaseQuantity: 0,
      purchaseUnit: u.purchaseUnit || "",
      purchaseUnitCost: 0,

      conversionFactor: u.conversionFactor,

      quantity: u.quantity || 0,
      unit: u.purchaseUnit, //u.transactionUnit,

      unitCost: u.averageCost,

      beforeStock: u.prev,
      afterStock: u.next,

      totalAmount: Number(consumedValue.toFixed(2)),
      paidAmount: 0,
      dueAmount: 0,
      paymentStatus: null,
      paymentMethod: null,

      referenceType: "PRODUCTION",
      type,
      direction,
      note,
      createdBy,
      source,
      referenceId: orderId,
      createdAt: now,
    });
  }

  return Number(totalRawMaterialCost.toFixed(2));
}


