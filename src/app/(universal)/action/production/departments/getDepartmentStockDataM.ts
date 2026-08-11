"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";

interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  averageCost: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}


export async function getDepartmentStockDataM(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  items: DepartmentStockRequest[]
): Promise<DepartmentStockUpdate[]> {
  const db = adminDb;

  const updates: DepartmentStockUpdate[] = [];

  for (const item of items) {



    const query = db
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", item.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();

      updates.push({
        ref: doc.ref,
        exists: true,

        departmentId,
        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,
        currentQuantity: Number(data.quantity || 0),
        quantityChange: item.quantity, 
        newPurchaseUnitCost: 0,
        averageCost: item.averageCost,
        conversionFactor: item.conversionFactor,
        consumptionUnit: item.consumptionUnit,
        purchaseUnit: item.purchaseUnit,
        

      });
    } else {
      updates.push({
        ref: null,
        exists: false,

        departmentId,

        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.inventoryItemName,
newPurchaseUnitCost:0,
        currentQuantity: 0,
         quantity: item.quantity,

        averageCost: item.averageCost,

        purchaseUnit: item.purchaseUnit,
        consumptionUnit: item.consumptionUnit,
        conversionFactor: item.conversionFactor,
      });
    }
  }

  return updates;
}