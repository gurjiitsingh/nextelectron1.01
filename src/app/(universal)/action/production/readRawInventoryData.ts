"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";
import { RawInventoryUpdateIssue } from "@/lib/types/inventory/RawInventoryUpdateTypeIssue";
import { before } from "node:test";

export async function readRawInventoryData(
  tx: FirebaseFirestore.Transaction,
  direction: "IN" | "OUT",
  items: {
    inventoryItemId: string;
    quantity: number;
    averageCost: number;
    conversionFactor: number;
    purchaseUnit: string;
    consumptionUnit: string;
  }[]
) {


  const updates: RawInventoryUpdateIssue[] = [];

  // console.log("purcahseunitcost----------------------------", items)

  for (const item of items) {


    const sendQty = Number(item.quantity) || 0;


    if (sendQty <= 0) continue;

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

    // ==================== INVENTORY DATA ========================== =====
    const currentStock = Number(data.currentStock) || 0;
   
    // ===== Stock Calculation =====
    let afterStock = currentStock - sendQty;

    // 🔥 EARLY STOP HERE (SAVES FUTURE READS)
    if (direction === "OUT" && currentStock < sendQty) {
      throw new Error(
        `${data.name}: Available ${currentStock} ${item.consumptionUnit}, Required ${sendQty} ${item.consumptionUnit}`
      );
    }
    updates.push({
      ref: inventoryRef,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: data.name || "",

      // ===== Quantity =====
      quantity: sendQty, // 🔄 was "quantity"

      // ===== INVENTORY =====
      averageCost: item.averageCost,
      conversionFactor: Number(item.conversionFactor) || 1, // 🔄 was "conversionFactor"
      consumptionUnit: item.consumptionUnit,
      purchaseUnit:item.purchaseUnit,
           
      beforeStock: currentStock,
      afterStock, // 🔄 now calculated earlier (was later)
      
    });
  }

  return updates;
}