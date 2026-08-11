"use server";
import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { getStockLocation } from "../distribution/getStockLocation";
import { applyFinishedTransactionsRead } from "./finishedStockLedger/applyFinishedTransactionsRead";
import { readRawInventoryRecipes } from "../inventory/rawInventory/readRawInventoryRecipes";
import { applyFinishedTransactionsWrite } from "./finishedStockLedger/applyFinishedTransactionsWrite";
import { updateDepartmentStockTx } from "../production/departments/UpdateDepartmentStockTx";
import { getDepartmentStockDataForProduction } from "../production/departments/getDepartmentStockDataForProduction";
import { validateRawStockProduction } from "../inventory/rawInventory/validateRawStockProduction";
import { departmentStockTransaction } from "../production/departments/departmentStockTransaction";
import { addStockLocationTx } from "../distribution/addStockLocation";
import { updateDepartmentStockAutoProduction } from "../production/departments/production/updateDepartmentStockAutoProduction";



type AdjustStockType = {
  id: string;
  batchId?: string;
  productName: string;
  sellingPrice: number;
  wholesalePrice: number;
  costPrice: number;
  avgCost: number;
  direction: "IN" | "OUT";
  quantity: number;
  transactionUnit: InventoryUnit;
  note?: string;
  createdBy?: string;

  departmentId: string;
  departmentName: string;
  managerName?: string;
  employeeCount?: number;
};


export async function autoStockProduction({
  id,
  //batchId,
  productName,
  sellingPrice,
  wholesalePrice,
  costPrice,
  avgCost,
  direction,

  quantity,
  transactionUnit,
  note,
  createdBy,
  // DPARTMENT
  departmentId,
  departmentName,
  managerName,
  employeeCount,
}: AdjustStockType) {


  // console.log("income----------------------", id,
  //   //batchId,
  //   productName,
  //   sellingPrice,
  //   wholesalePrice,
  //   costPrice,
  //   avgCost,
  //   direction,

  //   quantity,
  //   transactionUnit,
  //   note,
  //   createdBy,

  //   // DPARTMENT
  //   departmentId,
  //   departmentName,
  //   managerName,
  //   employeeCount,)
  const db = adminDb;
  const now = new Date();
  try {
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    const now = new Date();
    const datePart = now
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ""); // 20260710
    const timestamp = Date.now(); // unique
    const deptCode = departmentName?.replace(/\s+/g, "-").toUpperCase() || "DEPT";
    const batchId = `${deptCode}-${datePart}-${timestamp}`;

    await db.runTransaction(async (tx) => {
      // =========================
      // ✅ 1. READ
      // =========================
      let rawInventoryReads: any[] = [];

      if (direction === "IN") {
        rawInventoryReads = await readRawInventoryRecipes(tx, [
          { productId: id, quantity }
        ]);
      }

      //=============================
      // DEPARTMENT STOCK
      //=============================



      const departmentRecord =
        await getDepartmentStockDataForProduction(
          tx,
          departmentId,
          "OUT",
          rawInventoryReads
        );



      //=============================
      // READ STOCK 
      //=============================

      const finishedData = await applyFinishedTransactionsRead(tx, id);

      //=============================
      // READ STOCK LOCATION
      //=============================

      const storeLocation = await getStockLocation({
        tx,
        productId: id,
        locationType: "STORE",
        locationRef: "MAIN",
      });



      // =========================
      // ✅ 2. VALIDATE
      // =========================

      // if (direction === "IN") {
      //   validateRawStockProduction(rawInventoryReads);
      // }

      // =========================
      // ✅ 4. CREATE BATCH
      // =========================



      const batchRef = db
        .collection("production_batches")
        .doc(batchId);


      // =========================
      // ✅ 5. SAVE ITEMS IN BATCH
      // =========================

      const departmentMap = new Map(
        departmentRecord.map((u) => [
          u.inventoryItemId,
          u,
        ])
      );


      let batchCost = 0;


      for (const update of departmentRecord) {
        batchCost +=
          (Number(update.quantityChange) || 0) *
          (Number(update.newAverageCost) || 0) /
          (Number(update.conversionFactor) || 1);
      }

      const avgCostPerUnitProduction = batchCost / quantity;

      tx.set(batchRef, {
        id: batchId,
        departmentId,
        departmentName,
        productName,
        productUnit: transactionUnit,
        outputQty: quantity,

        batchCost,       // Total cost of producing the batch
        avgCostPerUnit: avgCostPerUnitProduction,   // Cost of one finished unit


        createdAt: now,
        note: note || "",
        startTime: now,
        employeeCount,
        isClosed: false,
      });

      for (const item of rawInventoryReads) {

        // =========================
        // ✅ 6. CONSUME DEPARTMENT STOCK
        // =========================

        const update = departmentMap.get(
          item.inventoryItemId
        );


        if (!update) {
          throw new Error(
            `Department stock not found for ${item.inventoryItemName}`
          );
        }

        const ref = db.collection("production_batch_items").doc();

        const averageCost = Number(update.newAverageCost);

        tx.set(ref, {
          id: ref.id,
          batchId,

          inventoryItemId: item.inventoryItemId,
          inventoryItemName: item.inventoryItemName,

          quantity: Number(update.quantityChange), // TOTAL QTY USE OR INVERTORY

          averageCost,
          costPerUnit: averageCost, // THIS COST IS IN PURCHASE UNITS
          itemTotalCost: Number(update.quantityChange) * averageCost / update.conversionFactor,  //TOAL COST OF UDE ITEM

          purchaseUnit: update.purchaseUnit,
          consumptionUnit: update.consumptionUnit,
          conversionFactor: update.conversionFactor,

          createdAt: now,
        });




        await updateDepartmentStockAutoProduction({
          transaction: tx,
          update,

        });

      }



      // =========================
      // ✅ 3. WRITE
      // =========================



      // 1 ✅ Update stock (finished currentStock)
      await applyFinishedTransactionsWrite(tx, {
        productId: id,
        batchId: batchId,
        productName,
        type: "PRODUCTION",
        direction,
        quantity,
        transactionUnit,

        unitPrice: avgCostPerUnitProduction,
        totalAmount: batchCost,
        note,
        createdBy,
        source: "ADMIN",

        readResult: finishedData,

// currentStock: finishedData.currentStock,
// currentStockValue:finishedData.stockValue,
// currentAvgCost: finishedData.avgCost,
      });



      // ==========================================
      // 6. WRITE DEPARTMENT LEDGER
      // ==========================================
   //  console.log("rawInventoryReads-----------------------", rawInventoryReads)
     for (const item of rawInventoryReads) {
  const update = departmentMap.get(item.inventoryItemId);

  if (!update) {
    throw new Error(
      `Department stock not found for ${item.inventoryItemName}`
    );
  }

  await departmentStockTransaction({
    transaction: tx,

    transferId: "kk",

    departmentId,
    departmentName,

    inventoryItemId: item.inventoryItemId,
    inventoryItemName: item.inventoryItemName,

    quantity: update.quantityChange!,

    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,

    averageCost: update.newAverageCost!,
    costPerUnit: update.newAverageCost!,
    totalCost:
      (update.quantityChange! * update.newAverageCost!) /
      update.conversionFactor,

    type: "PRODUCTION",
    direction: "OUT",
    referenceType: "DEPARTMENT_PRODUCTION",

    createdAt: now,
  });
}

      // =========================
      // ✅ Update Factory Location
      // =========================
      if (direction === "IN") {

        await addStockLocationTx({
          tx,
          stockLocation: storeLocation,

          productId: id,
          productName,
          sellingPrice,
          wholesalePrice,
          costPrice,
          avgCost,
          productMode: "finished_stock",

          locationType: "STORE",
          locationRef: "MAIN",

          quantity,
        });
      }

      // await addStockMovement({
      //   tx,

      //   movementType: "TRANSFER",
      //   batchId: "ABC",
      //   productId: id,
      //   productName,
      //   name: "FACTORY",
      //   locationCode: "NA",
      //   responsiblePerson: "ADMIN",
      //   //productMode: row.factory.productMode,

      //   quantity,

      //   fromLocationType: "FACTORY",
      //   fromLocationRef: "MAIN",

      //   toLocationType: "STOCK",
      //   toLocationRef: "NA",

      //   remarks: "NA",

      //   createdBy,
      // });

      // 1 ✅ NO NEED TO UPDATE RAW INVENTORY PRODUCTION TAKE STOCK FROM DPT

    });



    // =====================================================
    // CACHE
    // =====================================================
    // revalidateTag("products", "max");
    // revalidatePath("/admin/products");
    // revalidatePath("/admin/products/dashboard");

    return {
      success: true,
      message: "Stock updated successfully",
    };
  } catch (error: any) {
    console.error("❌ autoStockProduction:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}









// console.log("========== Department Production Ledger ==========");
// console.log("Item Name          :", item.inventoryItemName);

// console.log("Entered Quantity   :", item.quantity / item.conversionFactor);
// console.log("Average Cost       :", averageCost);
// console.log("Conversion Factor  :", item.conversionFactor);

// console.log(
//   "Final Quantity     :",
//   item.quantity / update.conversionFactor
// );

// console.log("Cost Per Unit      :", averageCost);

// console.log("Total Cost     :", Number(update.quantityChange) * averageCost / update.conversionFactor)

// console.log("Purchase Unit      :", update.purchaseUnit);
// console.log("Consumption Unit   :", update.consumptionUnit);
// console.log("Conversion Factor  :", update.conversionFactor);

// console.log("quantityChange  :", update.quantityChange);
// console.log("===============================================");
