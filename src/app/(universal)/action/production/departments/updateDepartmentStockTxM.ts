"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";
 

interface UpdateDepartmentStockInput {
  transaction: FirebaseFirestore.Transaction;
  update: DepartmentStockUpdate;

  // Actual stock movement:
  // +5 = add 5
  // -5 = remove 5
  qtyChange: number;
}

export async function updateDepartmentStockTxM({
  transaction: tx,
  update,
  qtyChange,
}: UpdateDepartmentStockInput) {
  const db = adminDb;
  const now = new Date();
  const StockQtyDPT =  (update.currentQuantity);
    const newQuantity = 
   StockQtyDPT! + qtyChange;

const stockValue = update.newStockValue;//StockQtyDPT * update.newAverageCost + qtyChange * update.newAverageCost;
const newAvgCost = stockValue! / newQuantity;

// console.log("currentQuantity---------------",update.inventoryItemName,":",  StockQtyDPT)
// console.log("transferQuantity---------------",update.inventoryItemName,":",  update.transferQuantity)
// console.log("newQuantity---------------",update.inventoryItemName,":",  newQuantity)
  


  if (newQuantity < 0) {
    throw new Error(
      `Insufficient department stock for "${update.inventoryItemName}". Available: ${StockQtyDPT}, Requested: ${Math.abs(
        qtyChange
      )}`
    );
  }

 

  if (update.exists && update.ref) {
    tx.update(update.ref, {
      quantity: newQuantity,
      currentQuantity: newQuantity,
      averageCost: newAvgCost,
      stockValue,
      updatedAt: now,
    });

    return;
  }

  // Cannot remove stock from a non-existing document
  if (qtyChange < 0) {
    throw new Error(
      `${update.inventoryItemName} does not exist in department stock.`
    );
  }

  const ref = db.collection("departmentStock").doc();

  tx.set(ref, {
    id: ref.id,

    departmentId: update.departmentId,

    inventoryItemId: update.inventoryItemId,
    inventoryItemName: update.inventoryItemName,

    quantity: newQuantity,

    averageCost: update.newAverageCost,

    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,

    updatedAt: now,
  });
}