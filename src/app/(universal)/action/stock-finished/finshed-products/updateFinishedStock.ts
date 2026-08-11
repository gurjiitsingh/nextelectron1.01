"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

type UpdateFinishedStockParams = {
  tx: FirebaseFirestore.Transaction;

  productId: string;

  mode: "SET" | "INCREASE" | "DECREASE";

  quantity: number;

  sellingPrice?: number;
  wholesalePrice?: number;
  costPrice?: number;

  // This updates the Firestore field: avgCost
  avgCost?: number;

  allowNegativeStock?: boolean;
};

export async function updateFinishedStock({
  tx,
  productId,
  mode,
  quantity,
  sellingPrice,
  wholesalePrice,
  costPrice,
  avgCost,
  allowNegativeStock = false,
}: UpdateFinishedStockParams) {
  console.log("========== updateFinishedStock ==========");
  console.log("productId:", productId);
  console.log("mode:", mode);
  console.log("quantity:", quantity);
  console.log("sellingPrice:", sellingPrice);
  console.log("wholesalePrice:", wholesalePrice);
  console.log("costPrice:", costPrice);
  console.log("avgCost:", avgCost);
  console.log("allowNegativeStock:", allowNegativeStock);
  console.log("========================================");

  const now = admin.firestore.FieldValue.serverTimestamp();

  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const snap = await tx.get(productRef);

  if (!snap.exists) {
    throw new Error("Product not found");
  }

  const product = snap.data()!;

  const beforeStock = Number(product.currentStock ?? 0);

  let afterStock = beforeStock;

  switch (mode) {
    case "SET":
      afterStock = quantity;
      break;

    case "INCREASE":
      afterStock = beforeStock + quantity;
      break;

    case "DECREASE":
      afterStock = beforeStock - quantity;
      break;
  }

  if (!allowNegativeStock && afterStock < 0) {
    throw new Error("Insufficient stock");
  }

  const finalAvgCost =
    avgCost ?? Number(product.avgCost ?? 0);

  const updateData: Record<string, any> = {
    currentStock: afterStock,
    stockStatus:
      afterStock > 0
        ? "in_stock"
        : "out_of_stock",
    stockValue: Number(
      (afterStock * finalAvgCost).toFixed(2)
    ),
    updatedAt: now,
  };

  if (sellingPrice !== undefined) {
    updateData.sellingPrice = sellingPrice;
  }

  if (wholesalePrice !== undefined) {
    updateData.wholesalePrice =
      wholesalePrice;
  }

  if (costPrice !== undefined) {
    updateData.costPrice = costPrice;
  }

  if (avgCost !== undefined) {
    updateData.avgCost = avgCost;
  }

  tx.update(productRef, updateData);

  console.log("afterStock:", afterStock);
  console.log("finalAvgCost:", finalAvgCost);
  console.log("stockValue:", updateData.stockValue);
  console.log("updateData:", updateData);
  console.log("========================================");

  return {
    beforeStock,
    afterStock,
  };
}