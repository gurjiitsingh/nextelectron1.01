"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import admin from "firebase-admin";

import { createInventoryTransaction } from "./createInventoryTransaction";

type PurchaseInventoryStockParams = {
  inventoryItemId: string;

  quantity: number;

  note?: string;

  createdBy?: string;

  referenceId?: string;

  referenceType?: string;
};

export async function purchaseInventoryStock(
  params: PurchaseInventoryStockParams
) {
  try {
    const {
      inventoryItemId,

      quantity,

      note,

      createdBy,

      referenceId,

      referenceType,
    } = params;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (quantity <= 0) {
      return {
        success: false,

        error:
          "Quantity must be greater than 0",
      };
    }

    // =====================================================
    // GET INVENTORY ITEM
    // =====================================================

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    const inventorySnap =
      await inventoryRef.get();

    if (!inventorySnap.exists) {
      return {
        success: false,

        error:
          "Inventory item not found",
      };
    }

    const inventory =
      inventorySnap.data();

    const previousStock =
      Number(
        inventory?.currentStock
      ) || 0;

    const newStock =
      previousStock + quantity;

    // =====================================================
    // UPDATE STOCK
    // =====================================================

    await inventoryRef.update({
      currentStock: newStock,

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    });

    // =====================================================
    // CREATE TRANSACTION
    // =====================================================

    await createInventoryTransaction({
      inventoryItemId,

      type: "PURCHASE",

      quantity,

      previousStock,

      newStock,

      note:
        note ||
        "Inventory stock added",

      referenceId:
        referenceId || "",

      referenceType:
        referenceType || "purchase",

      createdBy:
        createdBy || "system",
    });

    return {
      success: true,

      previousStock,

      newStock,
    };
  } catch (error) {
    console.error(
      "❌ purchaseInventoryStock failed:",
      error
    );

    return {
      success: false,

      error:
        "Could not add inventory stock",
    };
  }
}