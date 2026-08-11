"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import admin from "firebase-admin";

export async function getAllFinishedStock() {
  const snapshot = await adminDb
    .collection("stockLedgerFinished")
    .get();

  const map: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const data = doc.data();

    const productId = data.productId;
    const qty = Number(data.qty) || 0;

    if (!map[productId]) {
      map[productId] = 0;
    }

    if (data.direction === "IN") {
      map[productId] += qty;
    } else {
      map[productId] -= qty;
    }
  });

  return map;
}