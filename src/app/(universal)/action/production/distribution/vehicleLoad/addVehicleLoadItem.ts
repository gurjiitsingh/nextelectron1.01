"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type AddVehicleLoadItemInput = {
  loadId: string;
  tripId: string;

  productId: string;
  productName: string;

  quantity: number;

  costPerUnit: number;
  lineValue: number;

  sellingPrice?: number;
  wholesalePrice?: number;
};

export async function addVehicleLoadItem(
  tx: FirebaseFirestore.Transaction,
  input: AddVehicleLoadItemInput
) {
  const itemRef = adminDb
    .collection("vehicleLoadItems")
    .doc();

  tx.set(itemRef, {
    id: itemRef.id,

    // =========================
    // REFERENCES
    // =========================
    loadId: input.loadId,
    tripId: input.tripId,

    // =========================
    // PRODUCT
    // =========================
    productId: input.productId,
    productName: input.productName,

    // =========================
    // QUANTITY
    // =========================
    quantity: Number(input.quantity || 0),

    // =========================
    // COST
    // =========================
    costPerUnit: Number(input.costPerUnit || 0),
    lineValue: Number(input.lineValue || 0),

    // =========================
    // PRICES
    // =========================
    sellingPrice: Number(input.sellingPrice || 0),
    wholesalePrice: Number(input.wholesalePrice || 0),

    // =========================
    // TIMESTAMP
    // =========================
    createdAt: new Date(),
  });
}