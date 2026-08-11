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


export async function getDepartmentStockDataIssueStock(
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

   const currentStock = Number(data?.currentStock) || 0;
const DPTaverageCost = Number(data?.averageCost) || 0;

const departmentConversionFactor =
  Number(data?.conversionFactor) > 0
    ? Number(data!.conversionFactor)
    : Number(item.conversionFactor) || 1;

const incomingConversionFactor =
  Number(item.conversionFactor) > 0
    ? Number(item.conversionFactor)
    : 1;

const incomingAverageCost =
  Number(item.averageCost) || 0;

let newAverageCost = 0;
let newStockValue = 0;
let newCurrentStock = 0;

newCurrentStock = currentStock + Number(item.quantity);

newStockValue =
  (currentStock / departmentConversionFactor * DPTaverageCost) +
  (item.quantity / incomingConversionFactor * incomingAverageCost);

newAverageCost =
  newCurrentStock > 0
    ? newStockValue / (newCurrentStock / departmentConversionFactor)
    : 0;

 
    // Incoming stock expressed in purchase units

    console.log("===============GET DPT STOCK issue==================");
    console.log("Item:", item.inventoryItemName);
    console.log("Current Stock:", currentStock);
    console.log("send qty:", item.quantity);
    console.log("send qty conversiontFatctor:", item.conversionFactor);
    console.log("send qty purchaseUnitCoss:", item.averageCost!);


    
    console.log("DP averageCost:", data?.averageCost);

    console.log("item.conversionFactor:", item.conversionFactor);

    console.log("newCurrentStock:", newCurrentStock);
     console.log("old StockValue:", (currentStock / data?.conversionFactor * data?.averageCost));
     console.log("new qty StockValue:", (item.quantity / item.conversionFactor * item.averageCost!));
    console.log("newStockValue:", newStockValue);
    console.log("newAverageCost:", newAverageCost);
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