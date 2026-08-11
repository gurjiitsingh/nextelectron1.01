"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type UpdateProductionBatchItemParams = {
  transaction: FirebaseFirestore.Transaction;

  batchItemId: string;

  inventoryItemName: string;

  quantity: number;

  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  costPerUnit: number;

  updatedAt?: Date;
};

export async function updateProductionBatchItemTx({
  transaction,
  batchItemId,

  inventoryItemName,

  quantity,

  averageCost,

  purchaseUnit,
  consumptionUnit,
  conversionFactor,

  costPerUnit,

  updatedAt = new Date(),
}: UpdateProductionBatchItemParams) {
  const ref = adminDb
    .collection("production_batch_items")
    .doc(batchItemId);

  transaction.update(ref, {
    inventoryItemName,

    quantity,

    averageCost,

    purchaseUnit,
    consumptionUnit,
    conversionFactor,

    costPerUnit,

    totalCost: quantity * costPerUnit,

    updatedAt,
  });
}