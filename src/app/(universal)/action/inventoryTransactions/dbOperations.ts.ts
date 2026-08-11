"use server";

import admin from "firebase-admin";

import { adminDb } from "@/lib/firebaseAdmin";



import {
  revalidatePath,
  revalidateTag,
} from "next/cache";
import { newInventoryTransactionSchema } from "@/lib/types/InventoryTransactionType";

export async function addInventoryTransaction(
  formData: FormData
) {
  try {
    const inventoryItemId =
      formData.get(
        "inventoryItemId"
      ) as string;

    const type = formData.get(
      "type"
    ) as string;

    const quantityRaw =
      formData.get(
        "quantity"
      ) as string;

    const note = formData.get(
      "note"
    ) as string;

    const quantity =
      parseFloat(quantityRaw);

    const receivedData = {
      inventoryItemId,
      type,
      quantity,
      note,
    };

    const result =
      newInventoryTransactionSchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach(
        (issue) => {
          zodErrors[
            issue.path[0]
          ] = issue.message;
        }
      );

      return {
        errors: zodErrors,
      };
    }

    // FIND INVENTORY ITEM
    const inventoryDoc =
      await adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId)
        .get();

    if (!inventoryDoc.exists) {
      return {
        errors: {
          general:
            "Inventory item not found",
        },
      };
    }

    const inventoryData =
      inventoryDoc.data();

    const previousStock =
      Number(
        inventoryData?.currentStock || 0
      );

    let newStock = previousStock;

    // STOCK CALCULATION
    if (
      type === "purchase" ||
      type === "return"
    ) {
      newStock =
        previousStock + quantity;
    } else {
      newStock =
        previousStock - quantity;
    }

    // UPDATE STOCK
    await adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId)
      .update({
        currentStock: newStock,

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    // CREATE TRANSACTION
    const transactionData = {
      inventoryItemId,

      inventoryItemName:
        inventoryData?.name || "",

      type,

      quantity,

      previousStock,

      newStock,

      note: note || "",

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef =
      await adminDb
        .collection(
          "inventoryTransactions"
        )
        .add(transactionData);

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidateTag(
      "inventory-transactions",
      "max"
    );

    revalidatePath(
      "/admin/inventory"
    );

    revalidatePath(
      "/admin/inventory-transactions"
    );

    return {
      success: true,

      id: docRef.id,
    };
  } catch (error) {
    console.error(error);

    return {
      errors: {
        general:
          "Failed to create transaction",
      },
    };
  }
}
