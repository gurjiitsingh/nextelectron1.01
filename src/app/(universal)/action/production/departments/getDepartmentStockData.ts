"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockIssueUpdateType } from "@/lib/types/department/DepartmentStockUpdate";


interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  averageCost: number;
  purchaseUnit: string;
  purchaseUnitCostInv?: number;
  purchaseUnitCost?: number
  consumptionUnit: string;
  conversionFactor: number;
}


export async function getDepartmentStockData(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  dirction: "IN" | "OUT",
  items: DepartmentStockRequest[]
): Promise<DepartmentStockIssueUpdateType[]> {
  const updates: DepartmentStockIssueUpdateType[] = [];

  for (const item of items) {


    // Department Stock
    const query = adminDb
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", item.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    const exists = !snap.empty;
    const doc = exists ? snap.docs[0] : null;
    const data = doc?.data();

    const currentQuantity = Number(data?.currentStock ?? 0);




    const DPTpurchaseUnitCost = Number(data?.purchaseUnitCost);

    const safePurchaseUnitCost = Number.isFinite(DPTpurchaseUnitCost)
      ? DPTpurchaseUnitCost
      : 0;

    //console.log("item.purchaseUnitCostInv-------------------------------------", item.purchaseUnitCost)

    let currentStockInPurchaseUnit = 0;
    let newStockInPurchaseUnit = 0;

    if (dirction === "OUT" && item.quantity > currentQuantity) {
      throw new Error(
        `Insufficient department stock for ${item.inventoryItemName}`
      );
    }



    let newAverageCost = 0;
    let newStockValue = 0;
    let newPurchaseUnitCost = 0;
    let newCurrentStock = 0;




    if (dirction === "IN") {
      // Existing stock expressed in purchase units (bags, boxes, etc.)
      newCurrentStock =
        Number(data?.currentStock ?? 0) + Number(item.quantity);

      newStockValue = (data?.currentStock * data?.averageCost) / data?.conversionFactor + (item.quantity * item.purchaseUnitCost!) / item.conversionFactor;

      newAverageCost = newStockValue / (newCurrentStock / data?.conversionFactor)

      currentStockInPurchaseUnit =
        Number(data?.currentStock ?? 0) /
        Number(data?.conversionFactor ?? item.conversionFactor ?? 1);

      // Incoming stock expressed in purchase units
      newStockInPurchaseUnit =
        Number(item.quantity) /
        Number(item.conversionFactor);

      const incomingPurchaseUnitCost =
        Number(item.purchaseUnitCost ?? 0);


    } else {
      // OUT transaction keeps the same cost
      newPurchaseUnitCost = safePurchaseUnitCost;





    }

    console.log("=================================");
    console.log("Item:", item.inventoryItemName);
    console.log("Current Stock:", currentQuantity);
    console.log("Transfer Qty:", item.quantity);

    const conversionFactor =
      Number(data?.conversionFactor ?? item.conversionFactor);

    if (
      !Number.isFinite(conversionFactor) ||
      conversionFactor <= 0
    ) {
      throw new Error(
        `Conversion factor is missing or invalid for "${item.inventoryItemName}". Please update the inventory item before continuing.`
      );
    }

    currentStockInPurchaseUnit =
      Number(data?.currentStock ?? 0) /
      Number(data?.conversionFactor ?? 1);

    newStockInPurchaseUnit =
      Number(item.quantity ?? 0) /
      Number(item.conversionFactor ?? 1);

    console.log("Current Stock (Purchase Unit):", currentStockInPurchaseUnit);
    console.log("Incoming Stock (Purchase Unit):", newStockInPurchaseUnit);
    console.log("Current Purchase Unit Cost:", safePurchaseUnitCost);
    console.log("Incoming Purchase Unit Cost:", item.purchaseUnitCost);
    console.log("newPurchaseUnitCost---------------:", newPurchaseUnitCost);
    console.log("newStockValue---------------:", newStockValue);



    console.log("=================================");


    updates.push({
      ref: doc?.ref ?? null,
      exists,

      departmentId,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: item.inventoryItemName,

      quantityChange: item.quantity,

      newPurchaseUnitCost: newAverageCost,
      newCurrentStock,
      newAverageCost,
      newStockValue,

      purchaseUnit: item.purchaseUnit,
      consumptionUnit: item.consumptionUnit,
      conversionFactor: item.conversionFactor,
      
      beforeStock: data?.currentStock,
      afterStock: newCurrentStock,
    });
  }

  return updates;
}