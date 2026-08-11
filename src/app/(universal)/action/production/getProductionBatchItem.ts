"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type ProductionBatchItemType = {
  id: string;
  batchId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;

  averageCost: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  costPerUnit: number;
  totalCost: number;

  createdAt: number;
};

export async function getProductionBatchItem(
  tx: FirebaseFirestore.Transaction,
  itemId: string
): Promise<ProductionBatchItemType> {
  const ref = adminDb
    .collection("production_batch_items")
    .doc(itemId);

  const snap = await tx.get(ref);

  if (!snap.exists) {
    throw new Error("Batch item not found");
  }

  const data = snap.data()!;

  return {
    id: snap.id,
    batchId: data.batchId,

    inventoryItemId: data.inventoryItemId,
    inventoryItemName: data.inventoryItemName,

    quantity: Number(data.quantity) || 0,

    averageCost: Number(data.averageCost) || 0,
    purchaseUnit: data.purchaseUnit || "",
    consumptionUnit: data.consumptionUnit || "",
    conversionFactor: Number(data.conversionFactor) || 0,

    costPerUnit: Number(data.costPerUnit) || 0,
    totalCost: Number(data.totalCost) || 0,

    createdAt: data.createdAt
      ? data.createdAt.toMillis()
      : 0,
  };
}