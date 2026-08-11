"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdateDptReturnType } from "@/lib/types/inventory/RawInventoryUpdateDptReturnType";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";
import { before } from "node:test";

export async function readRawInventoryDataReturn(
  tx: FirebaseFirestore.Transaction,
  direction: "IN" | "OUT",
  formData: {
    inventoryItemId: string;
    quantityInPurcahseUnit: number;
    averageCostDpt: number;
    purchaseUnitDpt: string;
    quantity: number;
    purchaseUnitCostDpt: number;

    conversionFactorDpt: number;
  }[]
) {
  const updates: RawInventoryUpdateDptReturnType[] = [];

      console.log("=========FORM DATA IN (readRawInventoryDataReturn)===============")
console.log("formData------------------------",formData)
  for (const item of formData) {
    console.log("item-------------",item)
    const qty = Number(item.quantityInPurcahseUnit) || 0;
     const quantity = Number(item.quantity) || 0;


    if (qty <= 0) continue;

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(item.inventoryItemId);

    const snap = await tx.get(inventoryRef);

    if (!snap.exists) {
      throw new Error(
        `Inventory not found: ${item.inventoryItemId}`
      );
    }

    const data = snap.data()!;

    // ===== Store Data =====
    const currentStock = Number(data.currentStock) || 0;
    
    const averageCost = Number(data.averageCost) || 0;
    const currentStockValue = Number(data.stockValue) || 0;

    // console.log("send qty --------------------", qty)
    // console.log("befor stock --------------------", data.currentStock)

    // ===== Stock Calculation =====
    let afterStock = 0;

 if(direction == "OUT"){
      // ✅ Prevent negative stock
      if (qty > currentStock) {
        throw new Error(
          `Insufficient stock for1 ${data.name}`
        );
          
    }
  }
    
  afterStock = currentStock + quantity;

    updates.push({
      ref: inventoryRef,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: data.name || "",

      // ===== Quantity =====
      sendQty: qty, // 🔄 was "quantity"
     
      purchaseUnitCostDpt: item.purchaseUnitCostDpt,
      purchaseUnitDpt: item.purchaseUnitDpt, // 🔄 was store purchaseUnit
      averageCostDpt: Number(item.averageCostDpt) || 0,
      conversionFactorDpt: Number(item.conversionFactorDpt) || 1,
      transactionUnit: item.purchaseUnitDpt,
      //quantity: quantity,

      //==============INVENRTOY =============
      currentStock: currentStock,
      averageCost, // 🔄 was "unitCost"
      currentStockValue, // 🔄 was "stockValue"
      consumptionUnit: data.consumptionUnit || "gm",
      purchaseUnit: data.purchaseUnit,
      purchaseUnitCost: data.purchaseUnitCost,
      conversionFactor: data.conversionFactor,
      // ===== Stock =====

      beforeStock: currentStock,
      afterStock, // 🔄 now calculated earlier (was later)
      prev: currentStock,
      next: afterStock,
    });
  }

  return updates;
}