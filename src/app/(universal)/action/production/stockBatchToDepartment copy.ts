"use server";

import { adminDb } from "@/lib/firebaseAdmin";


import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";
import { validateRawStock } from "../inventory/rawInventory/validateRawStock";
import { applyRawInventoryWrites } from "../inventory/rawInventory/applyRawInventoryWrites";
import { CreateProductionBatchInputType } from "@/lib/types/production/CreateProductionBatchInputType";
import { getManualRawInventoryData } from "./getManualRawInventoryData";
import { updateDepartmentStock } from "./updateDepartmentStock";
import { getProductionBatchItem } from "./getProductionBatchItem";
import { getDepartmentStockItemByIdTx } from "./departments/getDepartmentStockItemById";

export async function stockBatchToDepartment({
  batchId,
  itemId,
  returnQty,
}: {
  batchId: string;
  itemId: string;
  returnQty: number;
}) {
  const db = adminDb;

const now = new Date();
 

  try {
  

    if (!itemId) {
      return { success: false, message: "Add items" };
    }


    
 
await db.runTransaction(async (tx) => {

  // =====================================
  // 1. READ BATCH ITEM
  // =====================================
  const batchItem = await getProductionBatchItem(tx, itemId);

  if (batchItem.batchId !== batchId) {
    throw new Error("Invalid batch item.");
  }
//console.log("batch data----------------", batchItem)


  // =====================================
  // 2. READ BATCH
  // =====================================
  const batchRef = db.collection("production_batches").doc(batchId);
  const batchSnap = await tx.get(batchRef);

  if (!batchSnap.exists) {
    throw new Error("Production batch not found.");
  }

  const batchData = batchSnap.data()!;
  const departmentId = batchData.departmentId;

  if (!departmentId) {
    throw new Error("Department not found for batch.");
  }

  // =====================================
  // 3. READ DEPARTMENT STOCK
  // =====================================
  const departmentStock = await getDepartmentStockItemByIdTx(
    tx,
    departmentId,
    batchItem.inventoryItemId
  );

  // console.log("departmentStock data----------------", departmentStock)
  // console.log("batchItem.quantity----------------", batchItem.quantity)
  // console.log("returnQty----------------", returnQty)
  // =====================================
  // 4. VALIDATION
  // =====================================
  if (returnQty <= 0) {
    throw new Error("Return quantity must be greater than zero.");
  }

  if (returnQty > batchItem.quantity) {
    throw new Error("Return quantity exceeds issued quantity.");
  }
const newItemQty = batchItem.quantity - returnQty;
const batchItemCostNew = batchItem.conversionFactor * newItemQty;
  // =====================================
  // 5. UPDATE BATCH ITEM
  // =====================================
  const itemRef = db.collection("production_batch_items").doc(itemId);

  tx.update(itemRef, {
    quantity: batchItem.quantity - returnQty,
  });

  // =====================================
  // 6. UPDATE DEPARTMENT STOCK
  // =====================================
  const departmentStockRef = db
    .collection("departmentStock")
    .doc(departmentStock!.id);

  tx.update(departmentStockRef, {
    quantity: departmentStock!.quantity + returnQty,
    updatedAt: now,
  });

  // =====================================
  // 7. 🔥 RECALCULATE COST (INSIDE TX)
  // =====================================
  const itemsSnap = await  db
  .collection("production_batch_items")
    .where("batchId", "==", batchId)
    .get();

  let newTotalRawCost = 0;

  itemsSnap.docs.forEach((doc) => {
    const d = doc.data();

    const qty = Number(d.quantity) || 0;
    const averageCostItem = Number(d.averageCost) || 0;
    const conversionFactor = Number(d.conversionFactor) || 0;
    const totalCostItemPerUnit = averageCostItem * conversionFactor;
   // console.log("new cost------------",qty, totalCostItemPerUnit)

    newTotalRawCost += newItemQty * totalCostItemPerUnit;
  });
 
  // =====================================
  // 8. UPDATE BATCH COST
  // =====================================

const outputQty = batchData.outputQty;

if (outputQty && outputQty > 0) {
  const newAvgCostPerUnit = newTotalRawCost / outputQty;

  tx.update(batchRef, {
    totalCost: newTotalRawCost,
    avgCostPerUnit: newAvgCostPerUnit,
    updatedAt: now,
  });
} else {
  // Only update total cost, skip per unit
  tx.update(batchRef, {
    totalCost: newTotalRawCost,
    updatedAt: now,
  });
}

 

});
//END OF TRANSACITON



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