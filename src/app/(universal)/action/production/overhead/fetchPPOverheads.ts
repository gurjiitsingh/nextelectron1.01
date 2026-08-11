"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type PPOverheadType = {
  id: string;

  productId: string;

  overheadType: string;

  quantity: number;

  unit: string;

  costPerUnit: number;

  totalCost: number;

  note: string;
};

export async function fetchPPOverheads(
  productId: string
) {
  try {
    if (!productId) {
      return {
        success: false,
        message: "Product ID is required",
        data: [] as PPOverheadType[],
      };
    }

    const snapshot = await adminDb
      .collection("pPOverheads")
      .where("productId", "==", productId)
      .orderBy("overheadType")
      .get();

    const data: PPOverheadType[] =
      snapshot.docs.map((doc) => {
        const item = doc.data();

        return {
          id: doc.id,

          productId: item.productId || "",

          overheadType:
            item.overheadType || "",

          quantity: Number(
            item.quantity ?? 0
          ),

          unit: item.unit || "",

          costPerUnit: Number(
            item.costPerUnit ?? 0
          ),

          totalCost: Number(
            item.totalCost ?? 0
          ),

          note: item.note || "",
        };
      });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(
      "fetchPPOverheads:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to fetch production overheads.",
      data: [] as PPOverheadType[],
    };
  }
}