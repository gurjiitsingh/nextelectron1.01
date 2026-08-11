"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";

import { getStockLocation } from "../distribution/getStockLocation";
import { addStockLocationTx } from "../distribution/addStockLocation";
import { addStockMovement } from "../distribution/addStockMovement";
import { getProductionBatchById } from "./batch/getProductionBatchById";
import { readProductStock } from "../stock-finished/finishedStockLedger/readProductStock";
import { writeProductStockUpdates } from "../stock-finished/finishedStockLedger/writeProductStockUpdates";
import { writeProductStockTransactions } from "../stock-finished/finishedStockLedger/writeProductStockTransactions";
import { getProductionBatchByIdTx } from "./getProductionBatchByIdTx";



type AdjustStockType = {
  id: string;
  batchId: string;
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
};

export async function stockProductionManual({ 
  id,
  batchId,
  productName,
  sellingPrice,
  wholesalePrice,
  costPrice,
  //avgCost,
  direction,

  quantity,
  transactionUnit,
  note,
  createdBy,
}: AdjustStockType) {
  const db = adminDb;

  try {
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }


    await db.runTransaction(async (tx) => {

      // =========================
      // ✅ 1. READ
      // =========================


    const batchRes = await getProductionBatchByIdTx(
  tx,
  batchId
);

      if (!batchRes.success) {
        throw new Error("Batch not found");
      }

      const batchData = batchRes.data;

      



      // 🔥 total raw cost (already correct)
      const totalRawCost = batchData!.calculatedTotalCost;



      const avgCostPerUnit = totalRawCost / quantity;
      
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


      // 1 ✅ Read stock (finished currentStock)
      const finishedData = await readProductStock(tx, id);

      // =========================
      // ✅ 3. WRITE
      // =========================
      // 1  Decrease department stock

 


      // 2 ✅ Update Batch

      //console.log("finishedData-------------------",finishedData.product)


      tx.update(
        db.collection("production_batches").doc(batchId),
        {
          outputQty: quantity,              // ✅ finished goods qty
          avgCostPerUnit: avgCostPerUnit,   // ✅ calculated cost
          totalCost: totalRawCost,          // (keep consistent)
          status: "CLOSED",                 // ✅ mark done
          endTime: new Date(),

        }
      );



      // 1 ✅ Update stock (finished currentStock)
      // 2 ✅ Create ledger entry (stockLedgerFinished transactions)
      // 2. Update finished product
      await writeProductStockUpdates(tx, {
        productId: id,
        batchId: batchId,
        productName,
        type: "PRODUCTION",
        direction:"IN",
        transactionUnit,
        unitPrice: 0,

        quantity,
        avgCostPerUnitProduct:avgCostPerUnit,
        totalRawCost,
        note,
        createdBy,
        source: "ADMIN",
        readResult: finishedData,
      });


         await writeProductStockTransactions(tx, {
        productId: id,
        batchId: batchId,
        productName,
        type: "PRODUCTION",
        direction:"IN",
        transactionUnit,
        unitPrice:avgCostPerUnit,

        quantity,
        avgCostPerUnitProduct:avgCostPerUnit,
        totalRawCost,
        note,
        createdBy,
        source: "ADMIN",
        readResult: finishedData,
      });


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
          avgCost: avgCostPerUnit,
          productMode: "finished_stock",

          locationType: "STORE",
          locationRef: "MAIN",

          quantity,
        });
      }

      await addStockMovement({
        tx,

        movementType: "TRANSFER",
        batchId: batchId,
        productId: id,
        productName,
        name: "FACTORY",
        locationCode: "NA",
        responsiblePerson: "ADMIN",
        //productMode: row.factory.productMode,

        quantity,

        fromLocationType: "FACTORY",
        fromLocationRef: "MAIN",

        toLocationType: "STOCK",
        toLocationRef: "NA",

        remarks: "NA",

        createdBy,
      });



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
    console.error("❌ updateFinishedItemStock:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}