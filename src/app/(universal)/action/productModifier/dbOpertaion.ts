"use server";

import { adminDb } from "@/lib/firebaseAdmin";


export async function saveProductModifiers(
  productId: string,
  groupIds: string[]
) {
  try {
    const ref = adminDb.collection("productModifiers");
    const productRef = adminDb.collection("products").doc(productId);

    const batch = adminDb.batch();

    // 🔥 1. delete old mappings
    const oldSnap = await ref.where("productId", "==", productId).get();

    oldSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 🔥 2. add new mappings
    groupIds.forEach((groupId) => {
      const newDoc = ref.doc();
      batch.set(newDoc, {
        productId,
        groupId,
      });
    });

    // ✅ 3. update product flag (ONLY ONCE)
    batch.update(productRef, {
      hasModifier: groupIds.length > 0,
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error saving product modifiers:", error);
    return { error: "Failed to save" };
  }
}

export async function saveProductModifiers_old(
  productId: string,
  groupIds: string[]
) {
  try {
    const ref = adminDb.collection("productModifiers");

    // 🔥 1. delete old mappings
    const oldSnap = await ref.where("productId", "==", productId).get();

    const batch = adminDb.batch();

    oldSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 🔥 2. add new mappings
    groupIds.forEach((groupId) => {
      const newDoc = ref.doc();
      batch.set(newDoc, {
        productId,
        groupId,
      });
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error saving product modifiers:", error);
    return { error: "Failed to save" };
  }
}


export async function getProductModifiers(productId: string) {
  try {
    const snap = await adminDb
      .collection("productModifiers")
      .where("productId", "==", productId)
      .get();

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching product modifiers:", error);
    return [];
  }
}