"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getTruckSaleDetail(
  saleId: string
) {
  try {
    if (!saleId) {
      return {
        success: false,
        message: "Sale ID required.",
      };
    }

    // =====================================================
    // SALE MASTER
    // =====================================================

    const saleRef = adminDb
      .collection("truckSales")
      .doc(saleId);

    const saleSnap = await saleRef.get();

    if (!saleSnap.exists) {
      return {
        success: false,
        message: "Truck sale not found.",
      };
    }

    const saleData = saleSnap.data()!;

    // =====================================================
    // SALE ITEMS
    // =====================================================

    const itemsSnap = await saleRef
      .collection("items")
      .get();

    const items = itemsSnap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,

        productId:
          d.productId || "",

        productName:
          d.productName || "",

        quantity:
          Number(d.quantity || 0),

        unitPrice:
          Number(d.unitPrice || 0),

        lineValue:
          Number(d.lineValue || 0),

        costPerUnit:
          Number(d.costPerUnit || 0),

        costValue:
          Number(d.costValue || 0),

        grossProfit:
          Number(d.grossProfit || 0),
      };
    });

    // =====================================================
    // RETURN
    // =====================================================

    return {
      success: true,

      data: {
        sale: {
          id: saleSnap.id,

          ...saleData,

          totalAmount:
            Number(saleData.totalAmount || 0),

          totalItems:
            Number(saleData.totalItems || 0),

          totalQuantity:
            Number(saleData.totalQuantity || 0),

          paidAmount:
            Number(saleData.paidAmount || 0),

          dueAmount:
            Number(saleData.dueAmount || 0),

          createdAt:
            saleData.createdAt?.toDate
              ? saleData.createdAt.toDate()
              : saleData.createdAt
                ? new Date(saleData.createdAt)
                : undefined,
        },

        items,
      },
    };

  } catch (error: any) {

    console.error(
      "❌ getTruckSaleDetail:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to get truck sale details.",
    };
  }
}