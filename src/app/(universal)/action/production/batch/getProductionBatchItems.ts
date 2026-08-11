"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductionBatchItemType } from "../getProductionBatchItem";

export async function getProductionBatchItems(
  batchId: string
): Promise<ProductionBatchItemType[]> {
  const itemsSnap = await adminDb
    .collection("production_batch_items")
    .where("batchId", "==", batchId)
    .get();

  return itemsSnap.docs.map((doc) => {
    const d = doc.data();

    return {
      id: doc.id,

      batchId: d.batchId || "",

      inventoryItemId: d.inventoryItemId || "",
      inventoryItemName: d.inventoryItemName || "",

      quantity: Number(d.quantity) || 0,

      unit: d.unit || "",

      purchaseUnit: d.purchaseUnit || "",
      consumptionUnit: d.consumptionUnit || "",
      conversionFactor: Number(d.conversionFactor) || 1,

      averageCost: Number(d.averageCost) || 0,
      costPerUnit: Number(d.costPerUnit) || 0,

      totalCost: Number(d.totalCost) || 0,
      itemTotalCost: Number(d.itemTotalCost || 0).toFixed(2),

      createdAt:
        d.createdAt &&
        typeof d.createdAt.toMillis === "function"
          ? d.createdAt.toMillis()
          : null,
    };
  });
}