"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getSupplierBusinessSummary() {
  try {
    const snapshot = await adminDb
      .collection("supplierAccounts")
      .get();

    let supplierDue = 0;
    let supplierAdvance = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      const due = Number(data.balance ?? 0);
      const advance = Number(data.creditBalance ?? 0);

      if (due > 0) {
        supplierDue += due;
      }

      if (advance > 0) {
        supplierAdvance += advance;
      }
    });

    return {
      success: true,
      data: {
        supplierDue,
        supplierAdvance,
      },
    };
  } catch (error) {
    console.error("getSupplierBusinessSummary:", error);

    return {
      success: false,
      data: {
        supplierDue: 0,
        supplierAdvance: 0,
      },
      message: "Failed to load supplier summary.",
    };
  }
}