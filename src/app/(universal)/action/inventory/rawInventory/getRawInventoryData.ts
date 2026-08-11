"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getRawInventoryData(
  tx: FirebaseFirestore.Transaction,
  orderItems: {
    productId: string;
    quantity: number;
  }[]
) {
  const updates: any[] = [];

  for (const item of orderItems) {
    const soldQty = Number(item.quantity) || 0;

    if (soldQty <= 0) continue;

    const productRef = adminDb
      .collection("productStock")
      .doc(item.productId);

    const productSnap = await tx.get(productRef);

    if (!productSnap.exists) {
      throw new Error(
        `Product not found: ${item.productId}`
      );
    }

    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("productId", "==", item.productId)
      .get();

    for (const doc of recipeSnapshot.docs) {
      const recipe = doc.data();

      const inventoryRef = adminDb
        .collection("inventoryItems")
        .doc(recipe.inventoryItemId);

      const invSnap = await tx.get(inventoryRef);

      if (!invSnap.exists) {
        throw new Error(
          `Inventory missing: ${recipe.inventoryItemId}`
        );
      }

      const invData = invSnap.data()!;

      const beforeStock =
        Number(invData.currentStock) || 0;

      const required =
        (Number(recipe.quantity) || 0) * soldQty;

      const afterStock =
        beforeStock - required;

     updates.push({
  ref: inventoryRef,

  inventoryItemId: recipe.inventoryItemId,
  itemName: invData.name || "",

  // ===== Units =====
  purchaseQuantity: 0,

  purchaseUnit:
    invData.purchaseUnit ||
    invData.consumptionUnit ||
    "pcs",

  conversionFactor:
    Number(invData.conversionFactor) || 1,

  quantity: required,

  transactionUnit:
    invData.consumptionUnit || "pcs",

  // ===== Inventory Valuation =====
  averageCost:
    Number(invData.averageCost) || 0,

  stockValue:
    Number(invData.stockValue) || 0,

  // Cost of consumed quantity
  unitCost:
    Number(invData.averageCost) || 0,

  purchaseUnitCost: 0,

  // ===== Stock =====
  prev: beforeStock,
  next: afterStock,
});
    }
  }

  return updates;
}