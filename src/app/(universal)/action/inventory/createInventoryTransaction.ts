"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
//import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

import admin from "firebase-admin";



type CreateInventoryTransactionParams =
  {
    inventoryItemId: string;

    type: InventoryTransactionNameType;

    quantity: number;

    previousStock: number;

    newStock: number;

    note?: string;

    referenceId?: string;

    referenceType?: string;

    createdBy?: string;
  };

export async function createInventoryTransaction(
  params: CreateInventoryTransactionParams
) {
  try {
    const {
      inventoryItemId,

      type,

      quantity,

      previousStock,

      newStock,

      note,

      referenceId,

      referenceType,

      createdBy,
    } = params;

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

    const inventoryData =
      inventorySnap.data();

    // =====================================================
    // SAVE TRANSACTION
    // =====================================================

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    const transactionData = {
      inventoryItemId,

      inventoryItemName:
        inventoryData?.name || "",

      type,

      quantity,

      previousStock,

      newStock,

      note: note || "",

      referenceId:
        referenceId || "",

      referenceType:
        referenceType || "",

      createdBy:
        createdBy || "system",

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

      year,
      month,
      day,
    };

    const docRef = await adminDb
      .collection(
        "inventoryTransactions"
      )
      .add(transactionData);

    return {
      success: true,

      id: docRef.id,
    };
  } catch (error) {
    console.error(
      "❌ createInventoryTransaction failed:",
      error
    );

    return {
      success: false,

      error:
        "Could not create inventory transaction",
    };
  }
}