"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";
import admin from "firebase-admin";

export async function deleteOldProductionBatches(
  olderThanDays: number = 30
) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(
      cutoffDate.getDate() - olderThanDays
    );

    const cutoffTimestamp =
      admin.firestore.Timestamp.fromDate(
        cutoffDate
      );

    const batchesSnapshot = await adminDb
      .collection("production_batches")
      .where("createdAt", "<", cutoffTimestamp)
      .get();

    if (batchesSnapshot.empty) {
      return {
        success: true,
        message: "No old batches found.",
        deletedBatches: 0,
        deletedItems: 0,
      };
    }

    let deletedBatches = 0;
    let deletedItems = 0;

    for (const batchDoc of batchesSnapshot.docs) {
      const batchId = batchDoc.id;

      const itemsSnapshot = await adminDb
        .collection("production_batch_items")
        .where("batchId", "==", batchId)
        .get();

      const batch = adminDb.batch();

      // Delete production_batch_items
      itemsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedItems++;
      });

      // Delete production_batches
      batch.delete(batchDoc.ref);
      deletedBatches++;

      await batch.commit();
    }

    revalidatePath("/admin/stock-finished/batchs");

    return {
      success: true,
      message: `${deletedBatches} old batches deleted successfully.`,
      deletedBatches,
      deletedItems,
    };
  } catch (error: any) {
    console.error(
      "deleteOldProductionBatches:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to delete old batches.",
    };
  }
}