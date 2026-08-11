"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { departmentStockTransactionInput } from "@/lib/types/department/departmentStockTransactionInput";

export async function departmentStockTransaction(
  input: departmentStockTransactionInput
) {
  const db = adminDb;

  try {
    // =========================
    // VALIDATION
    // =========================

    if (!input) {
      throw new Error("departmentStockTransaction: input is undefined");
    }

    if (!input.transaction) {
      console.warn(
        "departmentStockTransaction: No transaction supplied, creating standalone transaction."
      );
    }

    if (!input.transferId) {
      throw new Error("Missing trasferId");
    }

    if (!input.departmentId) {
      throw new Error("Missing departmentId");
    }

    if (!input.departmentName) {
      throw new Error("Missing departmentName");
    }

    if (!input.inventoryItemId) {
      throw new Error("Missing inventoryItemId");
    }

    if (!input.inventoryItemName) {
      throw new Error("Missing inventoryItemName");
    }

    if (input.quantity == null) {
      throw new Error("Missing quantity");
    }

    if (input.averageCost == null) {
      throw new Error("Missing averageCost");
    }

    if (input.costPerUnit == null) {
      throw new Error("Missing costPerUnit");
    }

    if (input.totalCost == null) {
      throw new Error("Missing totalCost");
    }

    if (!input.purchaseUnit) {
      throw new Error("Missing purchaseUnit");
    }

    if (!input.consumptionUnit) {
      throw new Error("Missing consumptionUnit");
    }

    if (input.conversionFactor == null) {
      throw new Error("Missing conversionFactor");
    }

    if (!input.createdAt) {
      throw new Error("Missing createdAt");
    }

    const save = async (
      tx?: FirebaseFirestore.Transaction
    ) => {
      const ref = db
        .collection("departmentStockTransactions")
        .doc();

      const data = {
        id: ref.id,

        trasferId: input.transferId,

        departmentId: input.departmentId,
        departmentName: input.departmentName,

        inventoryItemId: input.inventoryItemId,
        inventoryItemName: input.inventoryItemName,

        quantity: input.quantity,

        purchaseUnit: input.purchaseUnit,
        consumptionUnit: input.consumptionUnit,
        conversionFactor: input.conversionFactor,

        averageCost: input.averageCost,
        costPerUnit: input.costPerUnit,
        totalCost: input.totalCost,

        type: input.type,//"ISSUE_TO_DEPARTMENT",
        direction: input.direction,//"IN",

        referenceType: input.referenceType,//"PRODUCTION_BATCH",

        createdAt: input.createdAt,
      };

    

      if (tx) {
        tx.set(ref, data);
        return;
      }

      await ref.set(data);
    };

    if (input.transaction) {
      return await save(input.transaction);
    }

    return await db.runTransaction(async (tx) => {
      await save(tx);
    });
  } catch (error) {
    console.error(
      "❌ departmentStockTransaction failed:",
      error
    );
    throw error;
  }
}