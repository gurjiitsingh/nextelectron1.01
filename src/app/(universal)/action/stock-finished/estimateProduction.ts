"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getRawInventoryData } from "../inventory/rawInventory/getRawInventoryData";

import { InventoryUnit } from "@/lib/types/InventoryItemType";

type EstimateProductionType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
};

export async function estimateProduction({
  id,
  quantity,
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
          await getRawInventoryData(tx, [
            {
              productId: id,
              quantity,
            },
          ]);

        const items = rawUpdates.map((u) => {
          const requiredQty = Number(u.quantity) || 0;
          const availableQty = Number(u.prev) || 0;

          const shortageQty = Math.max(
            requiredQty - availableQty,
            0
          );

          const unitCost = Number(u.unitCost) || 0;

          const totalCost = requiredQty * unitCost/u.conversionFactor;

          return {
            inventoryItemId: u.inventoryItemId,
            itemName: u.itemName,
            requiredQty,
            availableQty,
            shortageQty,
            unit: u.transactionUnit,
            purchaseUnit: u.purchaseUnit,
            conversionFactor: u.conversionFactor,
            unitCost,
            totalCost,
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