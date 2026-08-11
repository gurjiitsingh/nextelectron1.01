"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function resetSupplierAccounts() {
  try {
    const snapshot = await adminDb
      .collection("supplierAccounts")
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "No supplier accounts found.",
        updated: 0,
      };
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        balance: 0,
        cardPaid: 0,
        cashPaid: 0,
        creditBalance: 0,
        totalCredit: 0,
        totalDebit: 0,
        totalPaid: 0,
        totalPurchase: 0,
        totalReturn: 0,
        upiPaid: 0,
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Supplier account totals reset successfully.",
      updated: snapshot.size,
    };
  } catch (error: any) {
    console.error("Error resetting supplier accounts:", error);

    return {
      success: false,
      message:
        error.message ||
        "Failed to reset supplier accounts.",
    };
  }
}