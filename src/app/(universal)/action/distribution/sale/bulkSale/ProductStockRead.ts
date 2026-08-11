"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export interface ProductStockRead {
  ref: FirebaseFirestore.DocumentReference;
  productId: string;
  productName: string;

  currentStock: number;
  currentStockValue: number;
  currentAverageCost: number;
  currentCostPrice: number;

  allowNegativeStock: boolean;
}

export async function readProductStock(
  tx: FirebaseFirestore.Transaction,
  productId: string
): Promise<ProductStockRead> {
  const ref = adminDb.collection("productStock").doc(productId);

  const snap = await tx.get(ref);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const data = snap.data()!;

  return {
    ref,

    productId,
    productName: data.productName || "",

    currentStock: Number(data.currentStock) || 0,
    currentStockValue: Number(data.stockValue) || 0,
    currentAverageCost: Number(data.averageCost) || 0,
    currentCostPrice: Number(data.costPrice) || 0,

    allowNegativeStock: Boolean(data.allowNegativeStock),
  };
}