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
// console.log("batch data----------------", batchItem)


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
//   if (batchData.status === "closed") {
//   throw new Error("Cannot modify closed batch.");
// }

  // =====================================
  // 3. READ DEPARTMENT STOCK
  // =====================================
  const departmentStock = await getDepartmentStockItemByIdTx(
    tx,
    departmentId,
    batchItem.inventoryItemId
  );
  if (!departmentStock) {
  throw new Error("Department stock not found.");
}

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


// =====================================
// 🔥 COST CALCULATION (DELTA METHOD)
// =====================================
const itemUnitCost =
  (Number(batchItem.averageCost) || 0) *
  (Number(batchItem.conversionFactor) || 0);

// cost of returned qty
const returnedCost = returnQty * itemUnitCost;

// previous total batch cost
const previousTotalCost = Number(batchData.totalCost) || 0;


if (returnedCost > previousTotalCost) {
  throw new Error("Return cost exceeds total batch cost.");
}
// new total batch cost
const newTotalRawCost = previousTotalCost - returnedCost;
const newTotalRawCostRounded = Number(newTotalRawCost.toFixed(4));

// safety check
if (newTotalRawCostRounded < 0) {
  throw new Error("Cost calculation error: negative total cost.");
}


  // =====================================
  // 5. UPDATE BATCH ITEM
  // =====================================
  const itemRef = db.collection("production_batch_items").doc(itemId);

  const newItemQty = batchItem.quantity - returnQty;

  if (newItemQty === 0) {
  // optional: delete item instead of keeping 0
  //prevent zero-quantity ghost item
  // tx.delete(itemRef);
}

tx.update(itemRef, {
  quantity: newItemQty,
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
  // 7. UPDATE BATCH COST
  // =====================================

const outputQty = batchData.outputQty;

if (outputQty && outputQty > 0) {
  const newAvgCostPerUnit = newTotalRawCostRounded / outputQty;

  tx.update(batchRef, {
    totalCost: newTotalRawCostRounded,
    avgCostPerUnit: newAvgCostPerUnit,
    updatedAt: now,
  });
} else {
  // Only update total cost, skip per unit
  tx.update(batchRef, {
    totalCost: newTotalRawCostRounded,
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