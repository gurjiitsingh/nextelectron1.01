"use server";

import { adminDb } from "@/lib/firebaseAdmin";


import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { getRawInventoryData } from "../../../inventory/rawInventory/getRawInventoryData";
import { getRawInventoryDptData } from "./getRawInventoryDptData";


type EstimateProductionType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  departmentId: string;
};

export async function estimateProductionDpt({
  id,
  quantity,
  departmentId,
}: EstimateProductionType) {
  if (!id) {
    return {
      success: false,
      message: "Product ID is required",
      items: [],
      totalEstimatedCost: 0,
      hasShortage: false,
    };
  }

  if (!quantity || quantity <= 0) {
    return {
      success: false,
      message: "Quantity must be greater than 0",
      items: [],
      totalEstimatedCost: 0,
      hasShortage: false,
    };
  }

  try {
    const result = await adminDb.runTransaction(
      async (tx) => {
        const rawUpdates =
          await getRawInventoryDptData(
            {
              tx,
              productId: id,
              quantity,
              departmentId: departmentId,
            },
          );

        const items = rawUpdates.map((u) => {
          const requiredQty = Number(u.requiredQty) || 0;
          const availableQty = Number(u.availableQty) || 0;

          const shortageQty = Math.max(
            requiredQty - availableQty,
            0
          );

          const unitCost = Number(u.unitCost) || 0;

          const totalCost = requiredQty * u.averageCostDptItem;
         // const totalCostInv = requiredQty * u.u.averageCostInvItem;

          return {
            inventoryItemId: u.inventoryItemId,
            itemName: u.itemName,
            requiredQty,
            availableQty,
            shortageQty,
            unit: u.transactionUnit,
            consumptionUnit: u.transactionUnit,
            purchaseUnit: u.purchaseUnit,
            conversionFactor: u.conversionFactor,
            unitCost,
            averageCostDptItem:u.averageCostDptItem,
            // averageCostInvItem:u.averageCostInvItem,
            totalCost,
            // totalCostInv,
          };
        });

        const totalEstimatedCost = items.reduce(
          (sum, item) => sum + item.totalCost,
          0
        );

        const hasShortage = items.some(
          (item) => item.shortageQty > 0
        );
      
        return {
          success: true,
          message: "Estimate generated",
          items,
          totalEstimatedCost,
          hasShortage,
        };
      }
    );


    return result;
  } catch (error: any) {
    console.error("estimateProduction:", error);

    return {
      success: false,
      message:
        error.message || "Failed to estimate production",
      items: [],
      totalEstimatedCost: 0,
      hasShortage: false,
    };
  }
}