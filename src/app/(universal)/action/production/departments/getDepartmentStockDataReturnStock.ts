"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockIssueUpdateType, DepartmentStockReturnUpdateType } from "@/lib/types/department/DepartmentStockUpdate";


interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  //sendQty: number;
  averageCost: number;
  purchaseUnit: string;
  purchaseUnitCostInv?: number;
  purchaseUnitCost?: number
  purchaseUnitCostDpt?:Number;
  consumptionUnit: string;
  conversionFactor: number;
}


export async function getDepartmentStockDataReturnStock(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  dirction: "IN" | "OUT",
  formData: {
    inventoryItemId: string;
    inventoryItemName: string;
    quantity: number;
   // sendQty: number;
    quantityInPurcahseUnit: number;
    averageCostDpt: number;
    purchaseUnitDpt: string;
 consumptionUnitDpt:string;
    purchaseUnitCostDpt: number;

    conversionFactorDpt: number;
  }[]
  //items: DepartmentStockRequest[]
): Promise<DepartmentStockReturnUpdateType[]> {
  const updates: DepartmentStockReturnUpdateType[] = [];

  for (const form of formData) {


    // Department Stock
    const query = adminDb
      .collection("departmentStock")
      .where("departmentId", "==", departmentId)
      .where("inventoryItemId", "==", form.inventoryItemId)
      .limit(1);

    const snap = await tx.get(query);

    const exists = !snap.empty;
    const doc = exists ? snap.docs[0] : null;
    const data = doc?.data();

    const currentStockDpt = Number(data?.currentStock ?? 0);

    let currentStockInPurchaseUnitDPT = 0;
    let newStockInPurchaseUnit = 0;

    if (dirction === "OUT" && form.quantity > currentStockDpt) {
      throw new Error(
        `Insufficient department stock for ${form.inventoryItemName}`
      );
    }


    console.log("==============GET DPT STOCK ===================");
    console.log("Item:", form.inventoryItemName);
    console.log("Current Stock DPT:", currentStockDpt);

    console.log("Transfer Qty:", form.quantity);

    const conversionFactor =
      Number(data?.conversionFactor ?? form.conversionFactorDpt);

    if (
      !Number.isFinite(conversionFactor) ||
      conversionFactor <= 0
    ) {
      throw new Error(
        `Conversion factor is missing or invalid for "${form.inventoryItemName}". Please update the inventory item before continuing.`
      );
    }

    currentStockInPurchaseUnitDPT =
      Number(data?.currentStock ?? 0) /
      Number(data?.conversionFactor ?? 1);

    newStockInPurchaseUnit =
      Number(form.quantity ?? 0) /
      Number(form.conversionFactorDpt ?? 1);

    console.log("Current Stock (Purchase Unit):", currentStockInPurchaseUnitDPT);
    console.log("Incoming Stock (Purchase Unit):", newStockInPurchaseUnit);
   
    console.log("Incoming Purchase Unit Cost:", form.purchaseUnitCostDpt);
    console.log("=================================");


    updates.push({
      ref: doc?.ref ?? null,
      exists,

      departmentId,
      inventoryItemId: form.inventoryItemId,
      inventoryItemName: form.inventoryItemName,

      purchaseUnitCostDpt:form.purchaseUnitCostDpt,

      quantityChange: form.quantity,
      purchaseUnitDpt: form.purchaseUnitDpt,
      consumptionUnitDpt: form.consumptionUnitDpt,
      conversionFactorDpt: form.conversionFactorDpt,
      
      beforeStock: currentStockDpt,
      afterStock: currentStockDpt - form.quantity,
    });
  }

  return updates;
}