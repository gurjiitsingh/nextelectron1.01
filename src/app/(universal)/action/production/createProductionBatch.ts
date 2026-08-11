"use server";

import { adminDb } from "@/lib/firebaseAdmin";


import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "./getManualRawInventoryData";
import { updateDepartmentStock } from "./updateDepartmentStock";

export async function createProductionBatch(
  input: CreateProductionBatchInputType 
) {
  const db = adminDb;




  try {
    if (!input.departmentId) {
      return { success: false, message: "Department required" };
    }

    if (!input.items.length) {
      return { success: false, message: "Add items" };
    }


    // ======================== BATCH ===============



    const now = new Date();

    const datePart = now
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ""); // 20260710

    const timestamp = Date.now(); // unique

    const deptCode =
      input.departmentName?.replace(/\s+/g, "-").toUpperCase() || "DEPT";

    const batchId = `${deptCode}-${datePart}-${timestamp}`;



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


      // =========================
      // ✅ 2. READ RAW INVENTORY
      // =========================

      const rawUpdates = await getManualRawInventoryData(
        tx,
        rawRequest
      );

      // =========================
      // ✅ 3. VALIDATE STOCK
      // =========================

      validateRawStock(rawUpdates);

      // =========================
      // ✅ 4. CREATE BATCH
      // =========================

     // console.log("point-----------------------1")

      const batchRef = db
        .collection("production_batches")
        .doc(batchId);

      tx.set(batchRef, {
        id: batchId,
        departmentId: input.departmentId,
        departmentName: input.departmentName,
        createdAt: now,
        note: input.note || "",
        startTime: now,
        isClosed: false,
      });

      // =========================
      // ✅ 5. SAVE ITEMS 
      // =========================
     // console.log("point-----------------------2")
      for (const item of input.items) {

         

        const ref = db.collection("production_batch_items").doc();

        tx.set(ref, {
          id: ref.id,
          batchId,
          inventoryItemId: item.inventoryItemId,
          inventoryItemName: item.inventoryItemName,
          quantity: item.quantity,
          averageCost: item.averageCost,        // 🔥 RAW (per gm)
          purchaseUnit: item.purchaseUnit,
          conversionFactor: item.conversionFactor,
          consumptionUnit: item.consumptionUnit,
          costPerUnit: item.costPerUnit,
          totalCost: item.quantity * item.costPerUnit!,
          createdAt: now,
        });


  // =========================
      // ✅ 6. MOVE STOCK TO DEPARTMENT
      // =========================

      await updateDepartmentStock({
        departmentId: input.departmentId,
        inventoryItemId : item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,
        averageCost: item.averageCost,
         conversionFactor: item.conversionFactor,
         purchaseUnit: item.purchaseUnit,
          consumptionUnit: item.consumptionUnit,
        qtyChange: +item.quantity,
      });


      }

      // =========================
      // ✅ 6. APPLY INVENTORY (IMPORTANT 🔥)
      // =========================
      //console.log("point-----------------------3")
      await applyRawInventoryWrites(
        tx,
        rawUpdates,
        `production-batch-${batchId}`,
        "TRANS TO DEPT",
        "OUT",
        "send to  department",
        "system",
        "PRODUCTION",
      );





    


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