"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function resetInventoryItemFields() {
  try {
    const snapshot = await adminDb.collection("inventoryItems").get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "No inventory items found.",
        updated: 0,
      };
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        averageCost: 0,
        currentStock: 0,
        costPrice: 0,
        stockValue: 0,
        sellingPrice: 0,
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Inventory item fields reset successfully.",
      updated: snapshot.size,
    };
  } catch (error: any) {
    console.error("Error resetting inventory items:", error);

    return {
      success: false,
      message:
        error.message ||
        "Failed to reset inventory item fields.",
    };
  }
}