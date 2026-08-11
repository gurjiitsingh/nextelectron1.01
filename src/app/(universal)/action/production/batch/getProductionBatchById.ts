"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductionBatchType } from "@/lib/types/batch/ProductionBatch";

export async function getProductionBatchById(
  batchId: string
): Promise<ProductionBatchType> {
  const batchSnap = await adminDb
    .collection("production_batches")
    .doc(batchId)
    .get();

  if (!batchSnap.exists) {
    throw new Error("Batch not found");
  }

  const batch = batchSnap.data()!;

  const startTime =
    batch.startTime?.toMillis?.() ?? null;

  const endTime =
    batch.endTime?.toMillis?.() ?? null;

  let durationHours = 0;
  let laborHours = 0;

  if (startTime) {
    const end = endTime ?? Date.now();

    durationHours =
      (end - startTime) /
      (1000 * 60 * 60);

    laborHours =
      durationHours *
      Number(batch.employeeCount || 0);
  }

  return {
    id: batchSnap.id,

    departmentId:
      batch.departmentId || "",

    departmentName:
      batch.departmentName || "",

    outputQty:
      Number(batch.outputQty) || 0,

    batchCost:
      Number(batch.batchCost) || 0,

    avgCostPerUnit:
      Number(batch.avgCostPerUnit) || 0,

    sellingPrice:
      Number(batch.sellingPrice) || 0,

    employeeCount:
      Number(batch.employeeCount) || 0,

    note:
      batch.note || "",

    status:
      batch.status || "OPEN",

    startTime,
    endTime,

    durationHours,
    laborHours,
  };
}