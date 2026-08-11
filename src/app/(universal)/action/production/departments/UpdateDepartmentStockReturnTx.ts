"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockIssueUpdateType, DepartmentStockReturnUpdateType } from "@/lib/types/department/DepartmentStockUpdate";
 


interface UpdateDepartmentStockInput {
  transaction: FirebaseFirestore.Transaction;
  dpRecord: DepartmentStockReturnUpdateType;
}

export async function updateDepartmentStockReturnTx({
  transaction: tx,
  dpRecord,
}: UpdateDepartmentStockInput) {
  const db = adminDb;
  const now = new Date();

  //console.log("dpRecord---------------------------", dpRecord)
let stockValue = dpRecord.afterStock! / dpRecord.conversionFactorDpt * dpRecord.purchaseUnitCostDpt;

  const data = {
    quantity: dpRecord.afterStock,
    currentStock: dpRecord.afterStock,
    stockValue,
    updatedAt: now,
  };

    if (dpRecord.exists && dpRecord.ref) {

    tx.update(dpRecord.ref, data);
    return;
  }

  console.log("Updating Firestore with:", data);

  const ref = db.collection("departmentStock").doc();

  tx.set(ref, {
    id: ref.id,

    departmentId: dpRecord.departmentId,

    inventoryItemId: dpRecord.inventoryItemId,
    inventoryItemName: dpRecord.inventoryItemName,

   // quantity: dpRecord.newQuantity,
     quantity: dpRecord.afterStock,
    currentStock: dpRecord.afterStock,
    stockValue,
    updatedAt: now,

  });
}