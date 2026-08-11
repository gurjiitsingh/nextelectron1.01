"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate, RawInventoryUpdatenNew } from "@/lib/types/inventory/RawInventoryUpdateType";
import { average } from "firebase/firestore";

export async function writeInventoryDataReturnStock(
  tx: FirebaseFirestore.Transaction,
  updates: RawInventoryUpdatenNew[],
  referenceId: string,
  direction: "IN" | "OUT" = "IN" // default should be IN for return
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  console.log("upates--------",updates)

  let totalValue = 0;

  for (const u of updates) {

   
   
let newStockQty = 0;
let newStockValue = u.beforeStock/u.conversionFactor* u.averageCost!  + u.averageCostDpt! * u.sendQty;
let newAvgPrice = newStockValue/(u.afterStock/u.conversionFactor);


console.log("========== Inventory Update ==========");
console.log("sendQty :", u.sendQty);
console.log("currentStock :", u.afterStock);
console.log("stockValue   :", newStockValue);
console.log("averageCost  :", newAvgPrice);

console.log("======================================");

    // ✅ Update Inventory
 tx.update(u.ref, {
  currentStock: u.afterStock,  
  stockValue: newStockValue,
  averageCost: newAvgPrice,
  updatedAt: now,
});


  }

  return Number(totalValue.toFixed(2));
}