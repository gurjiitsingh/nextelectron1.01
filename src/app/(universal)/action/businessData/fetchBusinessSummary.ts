"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function fetchBusinessSummary() {
  try {
    const [inventorySnapshot, productSnapshot] = await Promise.all([
      adminDb
        .collection("inventoryItems")
        .where("isActive", "==", true)
        .get(),

      adminDb
        .collection("productStock")
        .get(),
    ]);

    let rawMaterialValue = 0;
    let finishedProductValue = 0;

    // ==========================
    // Raw Material Value
    // ==========================
    inventorySnapshot.forEach((doc) => {
      const item = doc.data();

      rawMaterialValue += Number(item.stockValue ?? 0);
    });

    // ==========================
    // Finished Product Value
    // ==========================
    productSnapshot.forEach((doc) => {
      const product = doc.data();

      // Only finished products
    //  if (product.productMode !== "productStock") return;

      // Skip products that don't track inventory
      if (product.trackInventory === false) return;

      const currentStock = Number(product.currentStock ?? 0);

      const unitValue =
       // Number(product.avgCost ?? 0) ||
        Number(product.wholesalePrice ?? 0) 
        //||
      //  Number(product.costPrice ?? 0);

      finishedProductValue += currentStock * unitValue;
    });

    return {
      success: true,
      data: {
        rawMaterialValue,
        finishedProductValue,
        customerDue: 0,
        supplierDue: 0,
        cashInHand: 0,
      },
    };
  } catch (error) {
    console.error("fetchBusinessSummary:", error);

    return {
      success: false,
      data: null,
      message: "Failed to load dashboard summary.",
    };
  }
}