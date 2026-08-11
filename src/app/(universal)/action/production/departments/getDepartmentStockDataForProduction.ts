"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";

interface DepartmentStockRequest {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  averageCost: number;
  purchaseUnitCost: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}

export async function getDepartmentStockDataForProduction(
  tx: FirebaseFirestore.Transaction,
  departmentId: string,
  dirction: "IN" | "OUT",
  items: DepartmentStockRequest[]
): Promise<DepartmentStockUpdate[]> {
  const updates: DepartmentStockUpdate[] = [];




  for (const item of items) {
    // Inventory Item (only to ensure it exists)
    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(item.inventoryItemId);

    const inventorySnap = await tx.get(inventoryRef);

    const inventoryData = inventorySnap.data();

    // console.log("========== INVENTORY ==========");
    // console.log("Inventory Item:", item.inventoryItemName);
    // console.log("Inventory ID:", item.inventoryItemId);
    // console.log("Inventory Current Stock:", inventoryData?.currentStock);
    // console.log("Inventory Avg Cost:", inventoryData?.avgCost);
    // console.log("================================");

    if (!inventorySnap.exists) {
      throw new Error(
        `Inventory not found: ${item.inventoryItemId}`
      );
    }

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

    // console.log("========== DEPARTMENT STOCK ==========");
    // console.log("Department ID:", departmentId);
    // console.log("Direction:", dirction);

    // console.log("Department Stock Exists:", exists);
    // console.log("Department Doc ID:", doc?.id);

    // console.log("Inventory Item:", item.inventoryItemName);
    // console.log("Inventory Item ID:", item.inventoryItemId);

    // console.log("Department Quantity:", data?.quantity);
    // console.log("Department Avg Cost:", data?.averageCost);
    // console.log("Department Purchase Unit:", data?.purchaseUnit);
    // console.log("Department Consumption Unit:", data?.consumptionUnit);

    // console.log("======================================");


    const currentStock = Number(data?.currentStock ?? 0);
    const conversionFactor = Number(data?.conversionFactor ?? 0);
    const currentAverageCost = Number(data?.averageCost ?? 0);

    // console.log("========== STOCK CHECK ==========");
    // console.log("Required Qty:", item.quantity);
    // console.log("Department Qty:", currentStock);
    // console.log("Will Fail:", item.quantity > currentStock);
    // console.log("=================================");

    if (
      dirction === "OUT" &&
      item.quantity > currentStock
    ) {
      throw new Error(
        `Insufficient department stock for ${item.inventoryItemName}`
      );
    }

    let newAverageCost = 0;
    let newStockValue = 0;
    const newQuantity = currentStock - item.quantity;



    newAverageCost = Number(currentAverageCost.toFixed(2));
    newStockValue = Number((newQuantity / conversionFactor * currentAverageCost).toFixed(2));


    //     console.log("========== UPDATE OBJECT ==========");
    // console.log({
    //   departmentId,
    //   inventoryItemId: item.inventoryItemId,
    //   currentStock,
    //   quantityChange: item.quantity,
    //   newQuantity,
    //   newAverageCost,
    //   newStockValue,
    // });
    // console.log("===================================");

    updates.push({
      ref: doc?.ref ?? null,
      exists,

      departmentId,

      inventoryItemId: item.inventoryItemId,
      inventoryItemName: item.inventoryItemName,

      quantityChange: item.quantity,

      currentQuantity: currentStock,
      newQuantity,
      newCurrentStock: newQuantity,
      afterStock: newQuantity,
      newAverageCost,
      newStockValue,

      // Use Department Stock values if available
      purchaseUnit:
        data?.purchaseUnit ?? item.purchaseUnit,

      newPurchaseUnitCost:
        data?.purchaseUnitCost ??
        item.purchaseUnitCost,

      consumptionUnit:
        data?.consumptionUnit ??
        item.consumptionUnit,

      conversionFactor: Number(
        data?.conversionFactor ??
        item.conversionFactor
      ),
    });
  }

  return updates;
}