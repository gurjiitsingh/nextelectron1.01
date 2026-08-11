"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { AddProductStockInput  } from "@/lib/types/productStockType";



export async function addProductStock(
  input: AddProductStockInput
) {
  try {
    const {
      id,
      name,
      productMode,
      sellingPrice,
      costPrice,
      sellingUnit = "kg", // ✅ default
      sku = "",
      barcode = "",
      categoryId,
      categoryName,
    } = input;

    // ❌ Avoid creating stock for simple products (optional rule)
    if (productMode === "simple") {
      return {
        skipped: true,
        message: "Stock not created for simple product",
      };
    }

    const docRef = adminDb
      .collection("productStock")
      .doc(id);

    // 🔍 Check if already exists (safety)
    const existing = await docRef.get();
    if (existing.exists) {
      return {
        skipped: true,
        message: "Stock already exists",
      };
    }

    // ✅ Create stock document
    await docRef.set({
      id,

      // SNAPSHOT
      name,
      categoryId: categoryId || null,
      categoryName: categoryName || null,

      // INVENTORY
      productMode,
      currentStock: 0,
      minStock: 0,

      // TRACKING
      sku,
      barcode,

      // 💰 PRICING (FLAT STRUCTURE)
      sellingPrice,
      costPrice,
      price: sellingPrice,
      avgCost: costPrice, // initial same as cost
      wholesalePrice: null,

      // 📦 UNIT
      sellingUnit,

      // 🔁 CONTROL
      priceSyncEnabled: true,

      trackInventory: true,
      allowNegativeStock: false,

      // META
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Product stock created",
    };
  } catch (error) {
    console.error(
      "❌ Error creating productStock:",
      error
    );

    return {
      success: false,
      error: "Failed to create product stock",
    };
  }
}