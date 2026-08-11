"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getVehicleLoadDetail(loadId: string) {
  try {
    if (!loadId) {
      return {
        success: false,
        message: "Load ID required.",
      };
    }

    // ============================================
    // LOAD MASTER
    // ============================================

    const loadRef = adminDb
      .collection("vehicleLoads")
      .doc(loadId);

    const loadSnap = await loadRef.get();

    if (!loadSnap.exists) {
      return {
        success: false,
        message: "Load not found.",
      };
    }

    const loadData = loadSnap.data()!;

    // ============================================
    // LOAD ITEMS
    // ============================================

    const itemsSnap = await adminDb
      .collection("vehicleLoadItems")
      .where("loadId", "==", loadId)
      .get();

    const items = itemsSnap.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,

        loadId: d.loadId,
        tripId: d.tripId,

        productId: d.productId,
        productName: d.productName,

        quantity: Number(d.quantity || 0),

        costPerUnit: Number(d.costPerUnit || 0),

        lineValue: Number(d.lineValue || 0),

        sellingPrice: Number(d.sellingPrice || 0),

        wholesalePrice: Number(d.wholesalePrice || 0),
      };
    });

    // ============================================
    // RETURN
    // ============================================

    return {
      success: true,

      data: {
        load: {
          id: loadSnap.id,

          ...loadData,

          createdAt: loadData.createdAt?.toDate
            ? loadData.createdAt.toDate()
            : loadData.createdAt,
        },

        items,
      },
    };
  } catch (error: any) {
    console.error(
      "❌ getVehicleLoadDetail:",
      error
    );

    return {
      success: false,

      message:
        error?.message ||
        "Failed to get load details.",
    };
  }
}