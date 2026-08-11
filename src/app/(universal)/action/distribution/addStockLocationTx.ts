"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { StorageType } from "@/lib/types/distribution/StorageType";
import admin from "firebase-admin";

// type AddStockLocationProps = {
//   tx: FirebaseFirestore.Transaction;

//   existing: StockLocationType | null | undefined;

//   productId: string;
//   productName: string;
//  sellingPrice:  number;
//   wholesalePrice:  number;
//   costPrice:  number;
//   avgCost:  number;
//  productMode?: "raw_stock" | "finished_stock" | "simple";

//   locationType: StorageType;
//   locationRef: string;

//   quantity: number;
// };

type AddStockLocationProps = {
  tx: FirebaseFirestore.Transaction;
  existing: StockLocationType | null | undefined;
} & Omit<StockLocationType, "id" | "updatedAt">;

export async function addStockLocation({
  tx,
  existing,
  productId,
  productName,
    sellingPrice,
      wholesalePrice,
      costPrice,
      avgCost,
//  productMode,
  locationType,
  locationRef,
  quantity,
}: AddStockLocationProps) {
  const id = `${productId}_${locationType}_${locationRef}`;

  const ref = adminDb.collection("stockLocation").doc(id);

  if (existing) {
    tx.update(ref, {
      quantity: admin.firestore.FieldValue.increment(quantity),
      updatedAt: Date.now(),
    });

    return;
  }

  const data: StockLocationType = {
    id,

    productId,
    productName,
      sellingPrice,
      wholesalePrice,
      costPrice,
      avgCost,

  //  productMode,

    locationType,
    locationRef,

    quantity,

    updatedAt: Date.now(),
  };

  tx.set(ref, data);
}