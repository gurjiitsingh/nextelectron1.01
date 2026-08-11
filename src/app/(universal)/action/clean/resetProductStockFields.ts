"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function resetProductStockFields() {
  try {
    const snapshot = await adminDb.collection("productStock").get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "No product stock records found.",
        updated: 0,
      };
    } 

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        currentStock: 0,
        sellingPrice: 0,
        costPrice: 0,
        avgCost: 0,
        stockValue: 0,
      });
    });

    await batch.commit();

    return {
      success: true,
      message: "Product stock fields reset successfully.",
      updated: snapshot.size,
    };
  } catch (error: any) {
    console.error("Error resetting product stock fields:", error);

    return {
      success: false,
      message:
        error.message ||
        "Failed to reset product stock fields.",
    };
  }
}