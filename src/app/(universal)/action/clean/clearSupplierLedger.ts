"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function clearSupplierLedger() {
  try {
    const collectionRef =
      adminDb.collection("supplierLedger");

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
      message: `Deleted ${deletedCount} supplier ledger records.`,
    };

  } catch (error: any) {
    console.error(
      "Clear supplierLedger error:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to clear supplier ledger.",
    };
  }
}