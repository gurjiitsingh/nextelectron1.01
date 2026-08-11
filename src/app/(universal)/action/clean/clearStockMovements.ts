"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function clearStockMovements() {
  try {
    const collectionRef =
      adminDb.collection("stockMovements");

    let deletedCount = 0;

    while (true) {
      const snapshot = await collectionRef
        .limit(500)
        .get();

      if (snapshot.empty) {
        break;
      }

      const batch = adminDb.batch();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      deletedCount += snapshot.size;
    }

    return {
      success: true,
      message: `Deleted ${deletedCount} stock movements.`,
    };

  } catch (error: any) {
    console.error(
      "Clear stockMovements error:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to clear stock movements.",
    };
  }
}