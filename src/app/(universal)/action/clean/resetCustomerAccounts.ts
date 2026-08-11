"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function resetCustomerAccounts() {
  try {
    const snapshot = await adminDb.collection("customerAccounts").get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "No customer accounts found.",
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
        totalReturn: 0,
        totalSales: 0,
        upiPaid: 0,
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Customer account totals reset successfully.",
      updated: snapshot.size,
    };
  } catch (error: any) {
    console.error("Error resetting customer accounts:", error);

    return {
      success: false,
      message:
        error.message ||
        "Failed to reset customer accounts.",
    };
  }
}