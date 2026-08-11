"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

type UpdateDepartmentInput = {
  id: string;

  name: string;
  code: string;
  type: "PRODUCTION" | "SERVICE";

  description?: string;

  managerId?: string;
  managerName?: string;

  isActive: boolean;
};

export async function updateDepartment(
  data: UpdateDepartmentInput
) {
  try {
    if (!data.id) {
      return {
        success: false,
        message: "Department ID missing",
      };
    }

    // 🔍 Check duplicate code (excluding current doc)
    const existingSnap = await adminDb
      .collection("departments")
      .where("code", "==", data.code.trim().toUpperCase())
      .get();

    const isDuplicate = existingSnap.docs.some(
      (doc) => doc.id !== data.id
    );

    if (isDuplicate) {
      return {
        success: false,
        message: "Department code already exists",
      };
    }

    await adminDb
      .collection("departments")
      .doc(data.id)
      .update({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        type: data.type,
        description: data.description || "",

        managerId: data.managerId || null,
        managerName: data.managerName || "",

        isActive: data.isActive,
        updatedAt: Date.now(),
      });

    revalidatePath("/admin/departments");
    revalidatePath("/admin/departments/list");

    return {
      success: true,
      message: "Department updated successfully",
    };
  } catch (error) {
    console.error("Update Department Error:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}