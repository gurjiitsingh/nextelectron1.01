"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { updateFinishedStock } from "./finshed-products/updateFinishedStock";

type AdjustStockType = {
  id: string;

  mode: "SET" | "INCREASE" | "DECREASE";

  quantity: number;

  avgCost?: number;
  sellingPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
};

export async function adjustFinishedItemStock({
  id,
  mode,
  quantity,
  avgCost,
  sellingPrice,
  wholesalePrice,
  costPrice,
}: AdjustStockType) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Product ID required",
      };
    }

    if (quantity < 0) {
      return {
        success: false,
        message: "Quantity cannot be negative",
      };
    }

    await adminDb.runTransaction(async (tx) => {
      console.log(
        "========== adjustFinishedItemStock =========="
      );
      console.log("productId:", id);
      console.log("mode:", mode);
      console.log("quantity:", quantity);
      console.log("avgCost:", avgCost);
      console.log("sellingPrice:", sellingPrice);
      console.log(
        "wholesalePrice:",
        wholesalePrice
      );
      console.log("costPrice:", costPrice);
      console.log(
        "============================================"
      );

      await updateFinishedStock({
        tx,
        productId: id,
        mode,
        quantity,
        avgCost,
        sellingPrice,
        wholesalePrice,
        costPrice,
      });
    });

    return {
      success: true,
      message: "Stock updated successfully",
    };
  } catch (error: any) {
    console.error(
      "❌ updateFinishedItemStock:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to update stock",
    };
  }
}