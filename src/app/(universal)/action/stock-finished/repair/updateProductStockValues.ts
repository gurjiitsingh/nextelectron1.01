"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type UpdateProductStockInput = {
  id: string;
  currentStock: number;
  avgCost: number;
};

export async function updateProductStockValues({
  id,
  currentStock,
  avgCost,
}: UpdateProductStockInput) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Product ID is required",
      };
    }

    const stock = Number(currentStock);
    const cost = Number(avgCost);

    if (!Number.isFinite(stock) || stock < 0) {
      return {
        success: false,
        message: "Invalid stock.",
      };
    }

    if (!Number.isFinite(cost) || cost < 0) {
      return {
        success: false,
        message: "Invalid average cost.",
      };
    }

    const stockValue = Number((stock * cost).toFixed(2));

    // ==========================
    // Update Product Stock
    // ==========================
    const productRef = adminDb
      .collection("productStock")
      .doc(id);

    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    await productRef.update({
      currentStock: stock,
      avgCost: cost,
      stockValue,
      updatedAt: Date.now(),
    });

    // ==========================
    // Update Stock Locations
    // ==========================
    const stockSnapshot = await adminDb
      .collection("stockLocation")
      .where("productId", "==", id)
      .get();

    if (!stockSnapshot.empty) {
      const batch = adminDb.batch();

      stockSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          currentStock: stock,
          avgCost: cost,
          stockValue,
          updatedAt: Date.now(),
        });
      });

      await batch.commit();
    }

    return {
      success: true,
      message: "Stock updated successfully.",
    };
  } catch (error) {
    console.error(
      "❌ Error updating product stock:",
      error
    );

    return {
      success: false,
      message: "Failed to update stock.",
    };
  }
}