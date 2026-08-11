"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getProductionBatches() {
  try {
    const snapshot = await adminDb
      .collection("production_batches")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const batches = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        departmentId: data.departmentId || "",
        departmentName: data.departmentName || "",

        // ✅ FIX HERE
        createdAt: data.createdAt?.toMillis?.() || 0,

        note: data.note || "",
        isClosed: data.isClosed || false,
      };
    });

    return { success: true, data: batches };
  } catch (error: any) {
    console.error("getProductionBatches:", error);

    return {
      success: false,
      message: error.message || "Failed to fetch batches",
    };
  }
}