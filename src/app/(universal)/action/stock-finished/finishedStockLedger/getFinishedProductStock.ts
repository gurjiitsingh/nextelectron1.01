"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import admin from "firebase-admin";

export async function getFinishedProductStock(productId: string) {
  const snapshot = await adminDb
    .collection("stockLedgerFinished")
    .where("productId", "==", productId)
    .get();

  let stock = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();

    const qty = Number(data.qty) || 0;

    if (data.direction === "IN") {
      stock += qty;
    } else {
      stock -= qty;
    }
  });

  return stock;
}