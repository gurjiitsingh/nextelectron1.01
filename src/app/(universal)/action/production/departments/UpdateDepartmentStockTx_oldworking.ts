"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockIssueUpdateType } from "@/lib/types/department/DepartmentStockUpdate";
 


interface UpdateDepartmentStockInput {
  transaction: FirebaseFirestore.Transaction;
  update: DepartmentStockIssueUpdateType;
}

export async function updateDepartmentStockTx({
  transaction: tx,
  update,
}: UpdateDepartmentStockInput) {
  const db = adminDb;
  const now = new Date();


  const newStockValue = Number(
    (
      (update.newCurrentStock! * update.newPurchaseUnitCost) /
      update.conversionFactor
    ).toFixed(2)
  );

  console.log("========== Department Stock Update ==========");
  console.log("New Stock Value       :", update.newStockValue);
  console.log("New CurrentStock        :", update.newCurrentStock);
  console.log("Average Cost      :",  update.newAverageCost); // or update.newAverageCost

  console.log("new purchase Unit      :", update.newPurchaseUnitCost);  
  console.log("update.conversionFactor       :", update.conversionFactor);



  const data = {
    quantity: update.newCurrentStock,
    averageCost: update.newAverageCost,
    purchaseUnitCost: update.newAverageCost,//update.newPurchaseUnitCost,
    consumptionUnit:update.consumptionUnit,
    currentStock: update.newCurrentStock,
    stockValue: update.newStockValue,
    updatedAt: now,
  };

  //console.log("Updating Firestore with:", data);





  if (update.exists && update.ref) {

    tx.update(update.ref, data);
    return;
  }





  const ref = db.collection("departmentStock").doc();

  tx.set(ref, {
    id: ref.id,

    departmentId: update.departmentId,

    inventoryItemId: update.inventoryItemId,
    inventoryItemName: update.inventoryItemName,

   // quantity: update.newQuantity,
    currentStock: update.newCurrentStock,
    averageCost: update.newAverageCost,
    stockValue: update.newStockValue,
    purchaseUnitCost:  update.newPurchaseUnitCost,
    purchaseUnit: update.purchaseUnit,
    consumptionUnit: update.consumptionUnit,
    conversionFactor: update.conversionFactor,

    updatedAt: now,
  });
}