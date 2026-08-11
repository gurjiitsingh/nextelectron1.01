"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function initiateStockSession({
  createdBy,
}: {
  createdBy: string;
}) {
  try {
    // 1. create session
    const sessionRef = adminDb.collection("stockSessions").doc();

    const sessionId = sessionRef.id;

    await sessionRef.set({
      status: "ACTIVE",
      createdAt: FieldValue.serverTimestamp(),
      createdBy,
    });

    // 2. get all products
    const productsSnap = await adminDb.collection("products").get();

    const batch = adminDb.batch();

    productsSnap.forEach((doc) => {
      const p = doc.data();

      const stockRef = adminDb
        .collection("productStock")
        .doc();

      batch.set(stockRef, {
        sessionId,

        mainProductId: doc.id,

        name: p.name,
        price: p.price,

        currentStock: p.currentStock || 0,
        minStock: p.minStock || 0,

        productMode: p.productMode,

        inventoryItemId: p.inventoryItemId || null,
        trackInventory: p.trackInventory ?? true,
        allowNegativeStock: p.allowNegativeStock ?? false,

        createdAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    return {
      success: true,
      sessionId,
      message: "Stock session initiated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to initiate stock session",
    };
  }
}