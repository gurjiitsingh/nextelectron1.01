"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function clearCustomerLedger() {
  try {
    const snapshot = await adminDb
      .collection("customerLedger")
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "Customer ledger is already empty.",
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
      message: "Customer ledger cleared successfully.",
      deleted: snapshot.size,
    };

  } catch (error: any) {
    console.error(
      "❌ Error clearing customerLedger:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to clear customer ledger.",
    };
  }
}