"use server";

import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import admin from "firebase-admin";

type UpdateStockLocationProps = {
  tx: FirebaseFirestore.Transaction;
  snap: StockLocationType;
  quantity: number;
};

export async function updateStockLocation({
  tx,
  snap,
  quantity,
}: UpdateStockLocationProps) {
  const ref = admin
    .firestore()
    .collection("stockLocation")
    .doc(snap.id);

  tx.update(ref, {
    quantity: admin.firestore.FieldValue.increment(quantity),
    updatedAt: Date.now(),
  });
}