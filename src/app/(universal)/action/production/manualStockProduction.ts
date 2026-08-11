"use server";

import { adminDb } from "@/lib/firebaseAdmin";



import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { updateDepartmentStock } from "./updateDepartmentStock";
import { getDepartmentStockDataM } from "./departments/getDepartmentStockDataM";
import { departmentStockTransaction } from "./departments/departmentStockTransaction";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { updateDepartmentStockTxM } from "./departments/updateDepartmentStockTxM";
import { updateDepartmentStockTx } from "./departments/UpdateDepartmentStockTx";
import { updateDepartmentStockTxMNew } from "./departments/updateDepartmentStockTxMNew";

export async function manualStockProduction(
  input: CreateProductionBatchInputType
) {
  const db = adminDb;


  console.log("input -----------", input.items)

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

      // =========================
      // ✅ 3. VALIDATE STOCK
      // =========================

      // validateRawStock(departmentUpdates);
      // NOW IT NOT WORKS WE HAVE TO UPDATE IT
      // =========================
      // ✅ 4. CREATE BATCH
      // =========================



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
        employeeCount: input.employeeCount,
        isClosed: false,
      });

      // =========================
      // ✅ 5. SAVE ITEMS 
      // =========================

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
          totalCost: item.quantity * item.costPerUnit,
          createdAt: now,
        });


        // =========================
        // ✅ 6. CONSUME DEPARTMENT STOCK
        // =========================
        console.log("point-----------------------4")
        const update = departmentUpdates.find(
          (u) => u.inventoryItemId === item.inventoryItemId
        );

        if (!update) {
          throw new Error(
            `Department stock not found for ${item.inventoryItemName}`
          );
        }

        await updateDepartmentStockTxM({
          transaction: tx,
          update,
          qtyChange: -item.quantity,
        });


        //  await updateDepartmentStockTxMNew({
        //         departmentId: input.departmentId,
        //         inventoryItemId: item.inventoryItemId,
        //         inventoryItemName: item.inventoryItemName,
        //         averageCost: item.averageCost,
        //         conversionFactor: item.conversionFactor,
        //         purchaseUnit: item.purchaseUnit,
        //         consumptionUnit: item.consumptionUnit,
        //         qtyChange: -item.quantity,
        //       });


      }

      // =========================
      // ✅ 6. APPLY INVENTORY (IMPORTANT 🔥)
      // =========================




      // ==========================================
      // 6. WRITE DEPARTMENT LEDGER
      // ==========================================

      for (const item of input.items) {
        await departmentStockTransaction({
          transaction: tx,

          transferId: batchId,

          departmentId: input.departmentId,
          departmentName:
            input.departmentName,

          inventoryItemId:
            item.inventoryItemId,
          inventoryItemName:
            item.inventoryItemName,

          quantity: item.quantity,

          purchaseUnit:
            item.purchaseUnit,
          consumptionUnit:
            item.consumptionUnit,
          conversionFactor:
            item.conversionFactor,

          averageCost:
            item.averageCost,
          costPerUnit:
            item.costPerUnit,
          totalCost:
            item.quantity *
            item.costPerUnit,


          type: "PRODUCTION_BATCH",
          direction: "OUT",
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