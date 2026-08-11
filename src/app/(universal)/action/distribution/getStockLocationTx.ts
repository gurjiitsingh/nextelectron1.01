"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
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
}: GetStockLocationProps): Promise<StockLocationType | null> {
  const id = `${productId}_${locationType}_${locationRef}`;
 
  const ref = adminDb.collection("stockLocation").doc(id);

  const snap = await tx.get(ref);

  if (!snap.exists) {
    return null;
  }

  return snap.data() as StockLocationType;
}