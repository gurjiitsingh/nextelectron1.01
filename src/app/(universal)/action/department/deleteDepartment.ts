"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

export async function deleteDepartment(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Invalid department ID",
      };
    }

    // 🔥 SAFETY CHECK: Prevent delete if used in production
    const productionSnap = await adminDb
      .collection("productionEntries")
      .where("departmentId", "==", id)
      .limit(1)
      .get();

    if (!productionSnap.empty) {
      return {
        success: false,
        message:
          "Cannot delete. Department is used in production.",
      };
    }

    await adminDb
      .collection("departments")
      .doc(id)
      .delete();

    revalidatePath("/admin/departments");
    revalidatePath("/admin/departments/list");

    return {
      success: true,
      message: "Department deleted successfully",
    };
  } catch (error) {
    console.error("Delete Department Error:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}