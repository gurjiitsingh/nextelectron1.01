"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
//  averageCost: purchaseUnitCost,
export async function syncAverageCostFromPurchaseUnitCost() {
  try {
    const snapshot = await adminDb
      .collection("inventoryItems")
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "No inventory items found.",
        updated: 0,
      };
    }

    let batch = adminDb.batch();
    let batchCount = 0;
    let updated = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const purchaseUnitCost =
        Number(data.purchaseUnitCost) || 0;

      console.log("----------------------------------");
      console.log("Item:", data.name);
      console.log("Document ID:", doc.id);
      console.log(
        "Old averageCost:",
        data.averageCost
      );
      console.log(
        "purchaseUnitCost:",
        purchaseUnitCost
      );

      batch.update(doc.ref, {
        averageCost: purchaseUnitCost,
        // costPrice: purchaseUnitCost,
        updatedAt: FieldValue.serverTimestamp(),
      });

      updated++;
      batchCount++;

      // Firestore batch limit
      if (batchCount >= 450) {
        await batch.commit();

        console.log(
          `Committed batch of ${batchCount} items`
        );

        batch = adminDb.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log("==================================");
    console.log(
      "Average cost synchronization completed."
    );
    console.log("Items Updated:", updated);
    console.log("==================================");

    return {
      success: true,
      message: `Updated ${updated} inventory items.`,
      updated,
    };
  } catch (error: any) {
    console.error(
      "syncAverageCostFromPurchaseUnitCost:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to synchronize average costs.",
      updated: 0,
    };
  }
}