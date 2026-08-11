"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type DepartmentStock = {
  inventoryItemId: string;
  inventoryItemName: string;
  currentQty: number;
  averageCost: string;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
};

export async function getDepartmentStoc_k(departmentId: string) {
  try {
    const snapshot = await adminDb
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .get();

    const stockMap = new Map<string, DepartmentStock>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const existing = stockMap.get(data.inventoryItemId);

      if (existing) {
        existing.currentQty += data.qtyChange;
      } else {
        stockMap.set(data.inventoryItemId, {
          inventoryItemId: data.inventoryItemId,
          inventoryItemName: data.inventoryItemName,
          currentQty: data.qtyChange,
          averageCost: data.averageCost,
          purchaseUnit: data.purchaseUnit,
          consumptionUnit: data.consumptionUnit,
          conversionFactor: data.conversionFactor,
        });
      }
    });

    // remove zero stock items (optional)
    const result = Array.from(stockMap.values()).filter(
      (item) => item.currentQty !== 0
    );

    return result;
  } catch (error) {
    console.error("Error fetching department stock:", error);
    throw new Error("Failed to fetch department stock");
  }
}