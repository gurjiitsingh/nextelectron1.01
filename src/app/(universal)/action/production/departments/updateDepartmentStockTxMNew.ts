import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const updateDepartmentStockTxMNew = async ({
  transaction,
  departmentId,
  inventoryItemId,
  inventoryItemName,
  averageCost,
  purchaseUnit,
  conversionFactor,
  consumptionUnit,
  qtyChange,
}: {
  transaction: FirebaseFirestore.Transaction;
  departmentId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  averageCost: number;
  purchaseUnit: string;
  conversionFactor: number;
  consumptionUnit: string;
  qtyChange: number;
}) => {
  const ref = adminDb
    .collection("departmentStock")
    .doc(`${departmentId}_${inventoryItemId}`);

  const doc = await transaction.get(ref);

  if (!doc.exists) {
    transaction.set(ref, {
      departmentId,
      inventoryItemId,
      inventoryItemName,
      averageCost,
      purchaseUnit,
      conversionFactor,
      consumptionUnit,
      quantity: qtyChange,
      updatedAt: new Date(),
    });
  } else {
    transaction.update(ref, {
      quantity: admin.firestore.FieldValue.increment(qtyChange),
      updatedAt: new Date(),
    });
  }
};