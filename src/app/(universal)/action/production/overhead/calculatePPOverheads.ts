"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function calculatePPOverheads(
  productId: string
) {
  try {
    if (!productId) {
      return {
        success: false,
        message: "Product ID is required",
        totalOverheadCost: 0,
        items: [],
      };
    }

    const snapshot = await adminDb
      .collection("pPOverheads")
      .where("productId", "==", productId)
      .get();

    let totalOverheadCost = 0;

    const items = snapshot.docs.map((doc) => {
      const data = doc.data();

      const totalCost = Number(
        data.totalCost ?? 0
      );

      totalOverheadCost += totalCost;

      return {
        id: doc.id,

        productId: data.productId || "",

        overheadType:
          data.overheadType || "",

        quantity: Number(
          data.quantity ?? 0
        ),

        unit: data.unit || "",

        costPerUnit: Number(
          data.costPerUnit ?? 0
        ),

        totalCost,

        note: data.note || "",
      };
    });

    return {
      success: true,
      totalOverheadCost: Number(
        totalOverheadCost.toFixed(2)
      ),
      items,
    };
  } catch (error: any) {
    console.error(
      "calculatePPOverheads:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to calculate production overheads.",
      totalOverheadCost: 0,
      items: [],
    };
  }
}