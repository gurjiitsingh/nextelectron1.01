 

"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductStockType } from "@/lib/types/productStockType";

export async function readFinishedProductData({
  tx,
  productId,
}: {
  tx: FirebaseFirestore.Transaction;
  productId: string;
}) {

  console.log("productId--------------", productId)
  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const snap = await tx.get(productRef);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const product = snap.data() as ProductStockType;

  return {
    ref: productRef,

    // Flatten all product fields
    ...product,

    // Optional convenience values
    beforeStock: Number(product.currentStock) || 0,
    productPrice: Number(product.sellingPrice) || 0,
    productName: product.name || "",
  };
}