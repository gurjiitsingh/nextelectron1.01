"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function deleteProductStock(id: string) {
  try {
    const docRef = adminDb
      .collection("productStock")
      .doc(id);

    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        success: false,
        message: "Stock not found",
      };
    }

    await docRef.delete();

    return {
      success: true,
      message: "Product stock deleted",
    };
  } catch (error) {
    console.error("❌ deleteProductStock error:", error);

    return {
      success: false,
      message: "Failed to delete product stock",
    };
  }
}