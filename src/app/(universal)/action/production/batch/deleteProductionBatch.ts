"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

export async function deleteProductionBatch(
  batchId: string
) {
  try {
    if (!batchId) {
      return {
        success: false,
        message: "Batch ID is required",
      };
    }

    const batchRef = adminDb
      .collection("production_batches")
      .doc(batchId);

    const itemsSnapshot = await adminDb
      .collection("production_batch_items")
      .where("batchId", "==", batchId)
      .get();

    const batch = adminDb.batch();

    // Delete all batch items
    itemsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete batch document
    batch.delete(batchRef);

    await batch.commit();

    revalidatePath("/admin/stock-finished/batchs");

    return {
      success: true,
      message: "Batch deleted successfully",
    };
  } catch (error: any) {
    console.error(
      "deleteProductionBatch:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to delete batch",
    };
  }
}