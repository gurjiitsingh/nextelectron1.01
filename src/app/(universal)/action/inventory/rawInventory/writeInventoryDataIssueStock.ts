"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";
import { average } from "firebase/firestore";
import { RawInventoryUpdateIssue } from "@/lib/types/inventory/RawInventoryUpdateTypeIssue";

export async function writeInventoryDataIssueStock(
  tx: FirebaseFirestore.Transaction,
  updates: RawInventoryUpdateIssue[],
  referenceId: string,
  direction: "IN" | "OUT" = "IN" // default should be IN for return
) {
  const now = admin.firestore.FieldValue.serverTimestamp();


  let totalValue = 0;

  for (const inventory of updates) {


    const conversionFactor = inventory.conversionFactor
    const sendQty = inventory.quantity;
    const beforeStock = inventory.beforeStock;
    const afterStock = inventory.afterStock;
    const averageCost = inventory.averageCost;
    const newStockValue = Number((afterStock * averageCost / conversionFactor).toFixed(2));
    const newAvgPrice = Number((newStockValue / (afterStock / conversionFactor)).toFixed(2));

    console.log("==========  Update Inventory ==========");

    // console.log("sendQty :", sendQty);
    // console.log("afterStock :", afterStock);
    // console.log("newStockValue      :", newStockValue);

    // console.log("conversionFactor   :", conversionFactor);
    // console.log("averageCost  :", averageCost);
    // console.log("New averageCost  :", newAvgPrice);

    console.log("======================================");

    // ✅ Update Inventory
    tx.update(inventory.ref, {
      currentStock: afterStock,
      stockValue: newStockValue,
      averageCost: newAvgPrice,
      updatedAt: now,
    });


  }

  return Number(totalValue.toFixed(2));
}