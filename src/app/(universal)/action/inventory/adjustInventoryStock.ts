"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { inventoryAdjust } from "./inventoryAdjust";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type AdjustInventoryStockType = {
  inventoryItemId: string;

  type: InventoryTransactionNameType;
supplierId?:string;
supplierName?:string;
  direction: "IN" | "OUT";

  // INTERNAL (consumption unit)
  quantity: number;
  unitCost: number;
  stockValue?: number;
paidAmount?: number;
dueAmount?: number;
  // USER INPUT (purchase unit)
  purchaseQuantity?: number;
  purchaseUnit?: string;
  purchaseUnitCost?: number;
  conversionFactor?: number;
paymentMethod?:PaymentMethodType;
  paymentStatus: PaymentStatus;

  note?: string;
  createdBy?: string;

  referenceId?: string;

  referenceType?: "MANUAL";
};

export async function adjustInventoryStock({
  inventoryItemId,

  type,
  direction,

  quantity,
  unitCost,
  stockValue,

  purchaseQuantity,
  purchaseUnit,
  purchaseUnitCost,
  conversionFactor,
paymentMethod,
  paymentStatus,

  note,
  createdBy,

  referenceId,
  referenceType = "MANUAL",
}: AdjustInventoryStockType) {
  console.log("========== adjustInventoryStock ==========");

  console.log("inventoryItemId:", inventoryItemId);
  console.log("type:", type);
  console.log("direction:", direction);

  console.log("quantity:", quantity);
  console.log("unitCost:", unitCost);

  console.log("purchaseQuantity:", purchaseQuantity);
  console.log("purchaseUnit:", purchaseUnit);
  console.log("purchaseUnitCost:", purchaseUnitCost);
  console.log("conversionFactor:", conversionFactor);

  console.log("paymentStatus:", paymentStatus);

  console.log("note:", note);
  console.log("createdBy:", createdBy);

  console.log("referenceId:", referenceId);
  console.log("referenceType:", referenceType);

  console.log("stockValue:", stockValue);

  console.log("==========================================");

  try {
    // =====================================================
    // VALIDATION
    // =====================================================

    if (!inventoryItemId) {
      return {
        success: false,
        message: "Inventory item required",
      };
    }

    if (type !== "CLEAR" && quantity <= 0) {
      return {
        success: false,
        message: "Quantity must be greater than 0",
      };
    }

    // Cost required only when user is adding/replacing stock
    if (
      (type === "OPENING_STOCK") ||
      (type === "ADJUSTMENT" &&
        direction === "IN")
    ) {
      if ((purchaseUnitCost ?? 0) <= 0) {
        return {
          success: false,
          message:
            "Unit cost must be greater than 0",
        };
      }
    }

    await adminDb.runTransaction(async (tx) => {
      const inventoryRef = adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId);

      const inventorySnap =
        await tx.get(inventoryRef);

      if (!inventorySnap.exists) {
        throw new Error(
          "Inventory item not found"
        );
      }

      // =====================================================
      // CLEAR STOCK
      // =====================================================

      if (type === "CLEAR") {
        tx.update(inventoryRef, {
          currentStock: 0,
          stockValue: 0,
          purchaseUnitCost: 0,
          averageCost: 0,
          costPrice: 0,
          updatedAt:
            admin.firestore.FieldValue.serverTimestamp(),
        });

        return;
      }

      const inventoryData =
        inventorySnap.data();

      let averageCost = 0;
      let totalAmount = 0;

      switch (type) {
        case "OPENING_STOCK":
          averageCost = Number(unitCost);

          totalAmount =
            Number(stockValue) ||
            quantity * averageCost;

          break;

        case "ADJUSTMENT":
          if (direction === "IN") {
            averageCost = Number(unitCost);

            totalAmount =
              Number(stockValue) ||
              quantity * averageCost;
          } else {
            // Use current average cost
            averageCost = Number(
              inventoryData?.averageCost || 0
            );

            totalAmount =
              quantity * averageCost;
          }

          break;

        case "WASTAGE":
          averageCost = Number(
            inventoryData?.averageCost || 0
          );

          totalAmount =
            quantity * averageCost;

          break;
      }

      // =====================================================
      // UPDATE INVENTORY
      // =====================================================

      await inventoryAdjust(tx, {
        inventoryItemId,

        type,
        direction,

        quantity,

        unitCost: averageCost,
        totalAmount,
        stockValue,

        purchaseQuantity,
        purchaseUnit,
        purchaseUnitCost,
        conversionFactor,

        referenceType,
        referenceId,

        note,
        createdBy,

        source: "WEB_ADMIN",
      });
    });

    revalidateTag("inventory-items", "max");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/inventory/dashboard");

    return {
      success: true,
      message:
        "Inventory updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ adjustInventoryStock failed:",
      error
    );

    return {
      success: false,
      message:
        "Failed to update inventory",
    };
  }
}