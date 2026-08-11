"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

type Props = {
  saleId: string;

  productId: string;
  productName: string;

  quantity: number;

  // Selling price
  unitPrice: number;
  lineValue: number;

  // Cost / profit snapshot
  costPerUnit: number;
  costValue: number;
  grossProfit: number;
};

export async function addTruckSaleItem(
  tx: admin.firestore.Transaction,
  data: Props
) {
  const ref = adminDb
    .collection("truckSales")
    .doc(data.saleId)
    .collection("items")
    .doc();

  tx.set(ref, {
    id: ref.id,

    saleId: data.saleId,

    productId: data.productId,
    productName: data.productName,

    quantity: data.quantity,

    // Selling
    unitPrice: data.unitPrice,
    lineValue: data.lineValue,

    // Cost
    costPerUnit: data.costPerUnit,
    costValue: data.costValue,

    // Profit
    grossProfit: data.grossProfit,

    createdAt: new Date(),
  });
}