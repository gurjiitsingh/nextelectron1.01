"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

export async function deletePPOverhead(
  id: string
) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Overhead ID is required",
      };
    }

    const ref = adminDb
      .collection("pPOverheads")
      .doc(id);

    const snap = await ref.get();

    if (!snap.exists) {
      return {
        success: false,
        message: "Overhead not found",
      };
    }

    await ref.delete();

    revalidatePath("/admin/stock-finished");

    return {
      success: true,
      message:
        "Production overhead deleted successfully.",
    };
  } catch (error: any) {
    console.error(
      "deletePPOverhead:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Failed to delete production overhead.",
    };
  }
}