"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StorageType } from "@/lib/types/distribution/StorageType";

type GetStockLocationProps = {
  tx: FirebaseFirestore.Transaction;

  productId: string;

  locationType: StorageType;
  locationRef: string;
};

export async function getStockLocation({
  tx,
  productId,
  locationType,
  locationRef,
}: GetStockLocationProps) {
  const id = `${productId}_${locationType}_${locationRef}`;

  const ref = adminDb.collection("stockLocation").doc(id);

  return await tx.get(ref);
}