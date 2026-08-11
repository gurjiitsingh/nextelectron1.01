"use server";

import { adminDb } from "@/lib/firebaseAdmin";



import { validateRawStock } from "../../inventory/rawInventory/validateRawStock";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { updateDepartmentStock } from "../updateDepartmentStock";
import { getDepartmentStockDataM } from "../departments/getDepartmentStockDataM";
import { departmentStockTransaction } from "../departments/departmentStockTransaction";
import { applyRawInventoryWrites } from "../../inventory/rawInventory/applyRawInventoryWrites";
import { updateDepartmentStockTxM } from "../departments/updateDepartmentStockTxM";
import { updateDepartmentStockTx } from "../departments/UpdateDepartmentStockTx";
import { updateDepartmentStockTxMNew } from "../departments/updateDepartmentStockTxMNew";
import { updateProductionBatchItemTx } from "./updateProductionBatchItem";

export async function samiManualStockProduction(
  batchId: string,
  input: CreateProductionBatchInputType
) {
  const db = adminDb;


  console.log("input -----------", input.items)
const now = new Date();
  try {

    if (!input.items.length) {
      return { success: false, message: "Add items" };
    }


    // ========================READ DATA ===============


    await db.runTransaction(async (tx) => {
      // =========================
      // ✅ 1. PREPARE RAW REQUEST
      // =========================

      const rawRequest = input.items.map((item) => {
        const qtyInGrams = item.quantity * (item.conversionFactor || 1);

        return {
          inventoryItemId: item.inventoryItemId,
          quantity: qtyInGrams, // ✅ ALWAYS BASE UNIT
        };
      });


      console.log("point1-----------------------1")
      console.log("rawRequest-------------", rawRequest)
      // ==========================================
      // 3. READ DEPARTMENT STOCK
      // ==========================================

      const departmentUpdates =
        await getDepartmentStockDataM(
          tx,
          input.departmentId,
          input.items
        );
      console.log("point-----------------------2")
      console.log("department stock-------------", departmentUpdates)


      const batchRef = db
        .collection("production_batches")
        .doc(batchId);


      // ==========================================
      // READ EXISTING BATCH ITEMS
      // ==========================================

      const oldItemsSnap = await tx.get(
        db
          .collection("production_batch_items")
          .where("batchId", "==", batchId)
      );

      const oldItems = oldItemsSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      // Create lookup by inventoryItemId
      const oldItemMap = new Map(
        oldItems.map((item) => [
          item.inventoryItemId,
          item,
        ])
      );

      // =========================
      // ✅ 5. SAVE ITEMS 
      // =========================

for (const item of input.items) {
  const existing = oldItemMap.get(item.inventoryItemId);

  // =========================
  // Calculate quantity difference
  // =========================

  const oldQty = existing
    ? Number(existing.quantity)
    : 0;

  const qtyDifference =
    item.quantity - oldQty;

  // =========================
  // Update or Create Batch Item
  // =========================

  if (existing) {
    await updateProductionBatchItemTx({
      transaction: tx,
      batchItemId: existing.id,

      inventoryItemName: item.inventoryItemName,

      quantity: item.quantity,

      averageCost: item.averageCost,

      purchaseUnit: item.purchaseUnit,
      consumptionUnit: item.consumptionUnit,
      conversionFactor: item.conversionFactor,

      costPerUnit: item.costPerUnit!,

      updatedAt: now,
    });
  } else {
    const ref = db.collection("production_batch_items").doc();

    tx.set(ref, {
      id: ref.id,
      batchId,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: item.inventoryItemName,

      quantity: item.quantity,

      averageCost: item.averageCost,

      purchaseUnit: item.purchaseUnit,
      consumptionUnit: item.consumptionUnit,
      conversionFactor: item.conversionFactor,

      costPerUnit: item.costPerUnit,
      totalCost: item.quantity * item.costPerUnit!,

      createdAt: now,
    });
  }

  // =========================
  // Nothing changed
  // =========================

  if (qtyDifference === 0) {
    continue;
  }

  // =========================
  // Update Department Stock
  // =========================

  const update = departmentUpdates.find(
    (u) =>
      u.inventoryItemId ===
      item.inventoryItemId
  );

  if (!update) {
    throw new Error(
      `Department stock not found for ${item.inventoryItemName}`
    );
  }

  await updateDepartmentStockTxM({
    transaction: tx,
    update,

    // +2000 => consume 2000
    // -2000 => return 2000
    qtyChange: -qtyDifference,
  });

  // =========================
  // Department Ledger
  // =========================

  await departmentStockTransaction({
    transaction: tx,

    transferId: batchId,

    departmentId: input.departmentId,
    departmentName: input.departmentName,

    inventoryItemId: item.inventoryItemId,
    inventoryItemName: item.inventoryItemName,

    quantity: Math.abs(qtyDifference),

    purchaseUnit: item.purchaseUnit,
    consumptionUnit: item.consumptionUnit,
    conversionFactor: item.conversionFactor,

    averageCost: item.averageCost,
    costPerUnit: item.costPerUnit!,
    totalCost:
      Math.abs(qtyDifference) *
      item.costPerUnit!,

    type: "PRODUCTION_BATCH",

    direction:
      qtyDifference > 0 ? "OUT" : "IN",

    referenceType: "PRODUCTION_BATCH",

    createdAt: now,
  });
}




    });

    return {
      success: true,
      message: "Batch created successfully",
      batchId,
    };
  } catch (error: any) {
    console.error("❌ createProductionBatch:", error);

    return {
      success: false,
      message: error.message || "Failed",
    };
  }
}