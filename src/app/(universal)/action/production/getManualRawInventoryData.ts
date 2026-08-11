"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getManualRawInventoryData(
  tx: FirebaseFirestore.Transaction,
  items: {
    inventoryItemId: string;
    quantity: number;
  }[]
) {
  const updates: any[] = [];

  for (const item of items) {
    const qty = Number(item.quantity) || 0;

    if (qty <= 0) continue;

    // ✅ DIRECT inventory read (NO productStock)
    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(item.inventoryItemId);

    const snap = await tx.get(inventoryRef);

    if (!snap.exists) {
      throw new Error(
        `Inventory not found: ${item.inventoryItemId}`
      );
    }

    const data = snap.data()!;

    const beforeStock = Number(data.currentStock) || 0;

    const afterStock = beforeStock - qty;

    updates.push({
      ref: inventoryRef,

      inventoryItemId: item.inventoryItemId,
      itemName: data.name || "",

      // ===== Units =====
      purchaseQuantity: 0,

      purchaseUnit:
        data.purchaseUnit ||
        data.consumptionUnit ||
        "gm",

      conversionFactor:
        Number(data.conversionFactor) || 1,

      quantity: qty,

      transactionUnit:
        data.consumptionUnit || "pcs",

      // ===== Cost =====
      averageCost:
        Number(data.averageCost) || 0,

      stockValue:
        Number(data.stockValue) || 0,

      unitCost:
        Number(data.averageCost) || 0,

      purchaseUnitCost: 0,

      // ===== Stock =====
      prev: beforeStock,
      next: afterStock,
    });
  }

  return updates;
}