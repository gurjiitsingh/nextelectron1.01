"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function processRawInventory(
  tx: FirebaseFirestore.Transaction,
  orderId: string,
  orderItems: { productId: string; quantity: number }[]
) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  // 🔥 STORE ALL OPERATIONS FIRST
  const updates: any[] = [];

  for (const item of orderItems) {
    const soldQty = Number(item.quantity) || 0;
    if (soldQty <= 0) continue;

    const productRef = adminDb.collection("products").doc(item.productId);
    const productSnap = await tx.get(productRef);

    if (!productSnap.exists) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    // 👉 get recipes (outside tx is OK for query)
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
        throw new Error(`Inventory missing: ${recipe.inventoryItemId}`);
      }

      const invData = invSnap.data();
      const prev = Number(invData?.currentStock) || 0;

      const required =
        (Number(recipe.quantity) || 0) * soldQty;

      if (prev < required) {
        throw new Error(
          `Not enough raw material: ${invData?.name}`
        );
      }

      const next = prev - required;

      // 👉 STORE instead of writing
      updates.push({
        ref: inventoryRef,
        ledger: {
          inventoryItemId: recipe.inventoryItemId,
          itemName: invData?.name || "",
          type: "CONSUMPTION",
          direction: "OUT",
          qty: required,
          beforeStock: prev,
          afterStock: next,
        },
        next,
      });
    }
  }

  // ==================================================
  // 🟢 PHASE 2: APPLY ALL WRITES
  // ==================================================
  for (const u of updates) {
    tx.update(u.ref, {
      currentStock: u.next,
      updatedAt: now,
    });

    const ledgerRef = adminDb.collection("stockLedgerInventory").doc();

    tx.set(ledgerRef, {
      ...u.ledger,
      referenceId: orderId,
      referenceType: "PRODUCTION",
      createdAt: now,
    });
  }
}