"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function clearSupplierLedger() {
  try {
    const snapshot = await adminDb
      .collection("supplierLedger")
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "Supplier ledger is already empty.",
        deleted: 0,
      };
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      message: "Supplier ledger cleared successfully.",
      deleted: snapshot.size,
    };

  } catch (error: any) {
    console.error(
      "❌ Error clearing supplierLedger:",
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