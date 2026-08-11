"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

export async function deleteUnitConversion(
  id: string
) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Invalid ID",
      };
    }

    await adminDb
      .collection("inventoryUnitConversions")
      .doc(id)
      .delete();

    revalidatePath(
      "/admin/inventory/unit-conversions"
    );

    return {
      success: true,
      message: "Deleted successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to delete",
    };
  }
}