"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { RawInventoryUpdate } from "@/lib/types/inventory/RawInventoryUpdateType";
import { RawInventoryUpdateIssue } from "@/lib/types/inventory/RawInventoryUpdateTypeIssue";

export async function applyTransactionInventoryIssueStock(
  tx: FirebaseFirestore.Transaction,
  updates: RawInventoryUpdateIssue[],
  referenceId: string,
  type: string,
  direction: "IN" | "OUT" = "OUT",
        departmentId:string,
  departmentName:string,
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  let totalValue = 0;

  for (const inventory of updates) {

  
    const conversionFactor = inventory.conversionFactor
    const sendQty = inventory.quantity;
    const beforeStock = inventory.beforeStock;
    const afterStock = inventory.afterStock;
    const averageCost = inventory.averageCost;
    const transactionAmount = Number((sendQty / conversionFactor * averageCost).toFixed(2));;
   const newStockValue = Number((afterStock * averageCost / conversionFactor).toFixed(2));
    const newAvgPrice = Number((newStockValue / (afterStock / conversionFactor)).toFixed(2));
    

    console.log("========== Inventory Transactions ==========");
    console.log("sendQty :", sendQty);
    console.log("afterStock :", afterStock);
    console.log("averageCost  :", averageCost);
 console.log("transactionAmount  :", transactionAmount);
    console.log("======================================");

    // =====================================
    // Ledger
    // =====================================

    const ledgerRef =
      adminDb
        .collection("stockLedgerInventory")
        .doc();

    tx.set(ledgerRef, {
      transactionId: ledgerRef.id,

      inventoryItemId: inventory.inventoryItemId,
      inventoryItemName: inventory.inventoryItemName,

      partyId:  departmentId,
      partyName:  departmentName,
 
      type,

      direction,

      purchaseQuantity: inventory.quantity,
      purchaseUnit: inventory.purchaseUnit || "",
      purchaseUnitCost: inventory.averageCost,
      conversionFactor:inventory.conversionFactor,
     

      partyType: "SYSTEM",       

      sourceModule:
        direction === "OUT"
          ? "PRODUCTION"
          : "DEPARTMENT_RETURN",

      createdById: "system",

      quantity: inventory.quantity,
      consumptionUnit: inventory.consumptionUnit,
      beforeStock,
      afterStock,
      totalAmount: transactionAmount,
      transactionAmount,

      paidAmount: 0,
      dueAmount: 0,
      paymentStatus: null,
      paymentMethod: null,

      referenceType:
        direction === "OUT"
          ? "PRODUCTION"
          : "RETURN_TO_MAIN_STORE",

      referenceId,

      note:
        direction === "OUT"
          ? "Consumed in production"
          : "Returned from department",

      createdBy: "system",

      source:
        direction === "OUT"
          ? "PRODUCTION"
          : "DEPARTMENT_RETURN",

      createdAt: now,
    });
  }

  return Number(totalValue.toFixed(2));
}