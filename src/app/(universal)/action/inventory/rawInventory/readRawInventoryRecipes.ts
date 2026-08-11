"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function readRawInventoryRecipes(
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

//         console.log("========== RECIPE READ ==========");
// console.log("Product ID:", item.productId);
// console.log("Sold Qty:", soldQty);

// console.log("Recipe ID:", doc.id);
// console.log("Inventory Item ID:", recipe.inventoryItemId);

// console.log("Recipe Quantity:", recipe.quantity);
// console.log("Required Quantity:", required);

// console.log("Inventory Name:", invData.name);

// console.log("Current Stock:", invData.currentStock);
// console.log("Purchase Unit:", invData.purchaseUnit);
// console.log("Consumption Unit:", invData.consumptionUnit);
// console.log("Conversion Factor:", invData.conversionFactor);

// console.log("Average Cost:", invData.averageCost);
// console.log("Stock Value:", invData.stockValue);

// console.log("Before Stock:", beforeStock);
// console.log("After Stock:", afterStock);

// console.log("=================================");

updates.push({
  ref: inventoryRef,

  //======= Requried Feilds ===========
  inventoryItemId: recipe.inventoryItemId,
  inventoryItemName: invData.name || "",
  quantity: required,
consumption: required,

  // ===== On Requried Feilds =====
  purchaseQuantity: 0,

  purchaseUnit:
    invData.purchaseUnit ||
    invData.consumptionUnit ||
    "gm",

  conversionFactor:
    Number(invData.conversionFactor) || 1,

  

  transactionUnit:
    invData.consumptionUnit || "gm",
     consumptionUnit:
    invData.consumptionUnit || "gm",

  // ===== Cost =====
  averageCost:
    Number(invData.averageCost) || 0,

  stockValue:
    Number(invData.stockValue) || 0,

  unitCost:
    Number(invData.averageCost) || 0,
    costPerUnit:
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