"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type UpdateStockFromProductInput = {
  id: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  sellingPrice: number;
};

export async function updateProductStockOnEdit(
  input: UpdateStockFromProductInput
) {
  try {
    const {
      id,
      name,
      categoryId,
      categoryName,
      sellingPrice,
    } = input;

    const docRef = adminDb
      .collection("productStock")
      .doc(id);

    const snap = await docRef.get();

    // 🔥 CASE 1: Stock DOES NOT exist → CREATE
    if (!snap.exists) {
      await docRef.set({
        id,

        name,
        categoryId: categoryId || null,
        categoryName: categoryName || null,

        // productMode: "finished_stock", // default fallback

        // currentStock: 0,
        // minStock: 0,

        sellingPrice,
        // costPrice: sellingPrice, // fallback
        price: sellingPrice,     // legacy
        // avgCost: sellingPrice,

        sellingUnit: "kg",

        priceSyncEnabled: true,

        trackInventory: true,
        allowNegativeStock: false,

        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return {
        created: true,
        message: "Stock auto-created",
      };
    }

    // 🔥 CASE 2: Stock exists → UPDATE
    const stock = snap.data();

    const updateData: Record<string, any> = {
      name,
      categoryId: categoryId || null,
      categoryName: categoryName || null,
      updatedAt: Date.now(),
    };

    // ✅ Respect manual override
    if (stock?.priceSyncEnabled) {
      updateData.sellingPrice = sellingPrice;
      updateData.price = sellingPrice; // legacy
    }

    await docRef.update(updateData);

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "❌ updateProductStockOnEdit error:",
      error
    );

    return {
      success: false,
    };
  }
}