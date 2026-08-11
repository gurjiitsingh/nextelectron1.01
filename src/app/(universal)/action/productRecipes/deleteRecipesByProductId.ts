"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function deleteRecipesByProductId(
  productId: string
) {
  if (!productId) {
    return {
      success: false,
      message: "Product ID is required",
    };
  }

  try {
    const snapshot = await adminDb
      .collection("productRecipes")
      .where("productId", "==", productId)
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        message: "No recipes found",
      };
    }

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      success: true,
      message: `${snapshot.size} recipes deleted`,
    };
  } catch (error: any) {
    console.error(
      "❌ deleteRecipesByProductId:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to delete recipes",
    };
  }
}