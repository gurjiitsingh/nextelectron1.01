"use server";

import admin from "firebase-admin";
import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebaseAdmin";

type AddPPOverheadProps = {
  productId: string;

  overheadType: string;

  quantity: number;
  unit: string;

  costPerUnit: number;

  note?: string;
};

export async function addPPOverhead({
  productId,
  overheadType,
  quantity,
  unit,
  costPerUnit,
  note,
}: AddPPOverheadProps) {
  try {
    if (!productId) {
      return {
        success: false,
        message: "Product is required",
      };
    }

    if (!overheadType.trim()) {
      return {
        success: false,
        message: "Overhead type is required",
      };
    }

    if (quantity <= 0) {
      return {
        success: false,
        message: "Quantity must be greater than 0",
      };
    }

    if (costPerUnit < 0) {
      return {
        success: false,
        message: "Invalid cost",
      };
    }

    const now =
      admin.firestore.FieldValue.serverTimestamp();

    const totalCost = Number(
      (quantity * costPerUnit).toFixed(2)
    );

    const ref = adminDb
      .collection("pPOverheads")
      .doc();

    await ref.set({
      id: ref.id,

      productId,

      overheadType,

      quantity,
      unit,

      costPerUnit,
      totalCost,

      note: note ?? "",

      createdAt: now,
      updatedAt: now,
    });

    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      id: ref.id,
      message: "Production overhead added successfully.",
    };
  } catch (error: any) {
    console.error(
      "addPPOverhead:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to add production overhead.",
    };
  }
}