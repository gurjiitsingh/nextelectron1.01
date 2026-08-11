import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export const updateDepartmentStock = async ({
  departmentId,
  inventoryItemId,
  inventoryItemName,
  averageCost,
  purchaseUnit,
  conversionFactor,
  consumptionUnit,
  qtyChange,

}: {
  departmentId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  averageCost: number;
  purchaseUnit: string;
  conversionFactor: number;
  consumptionUnit: string;
  qtyChange: number
}) => {
  const ref = adminDb
    .collection("departmentStock")
    .doc(`${departmentId}_${inventoryItemId}`);

  const doc = await ref.get();

  if (!doc.exists) {
    await ref.set({
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
    await ref.update({
      quantity: admin.firestore.FieldValue.increment(qtyChange),
      updatedAt: new Date(),
    });
  }
};