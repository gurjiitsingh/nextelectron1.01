"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

type AddDepartmentInput = {
  name: string;
  code: string;
  type: "PRODUCTION" | "SERVICE";
  description?: string;

  managerId?: string;
  managerName?: string;

  employeeCount: number;

  isActive?: boolean;
};

export async function addDepartment(data: AddDepartmentInput) {
  try {
    // ✅ Validation
    if (
      !data.name ||
      !data.code ||
      !data.type ||
      !Number.isFinite(data.employeeCount) ||
      data.employeeCount < 1
    ) {
      return {
        success: false,
        message: "Please provide all required fields, including a valid employee count.",
      };
    }

    // 🔍 Check duplicate code
    const existingSnap = await adminDb
      .collection("departments")
      .where("code", "==", data.code.trim().toUpperCase())
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return {
        success: false,
        message: "Department code already exists",
      };
    }

    // 📄 Create doc
    const docRef = adminDb.collection("departments").doc();

    const newDepartment = {
      id: docRef.id,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      type: data.type,
      description: data.description || "",

      managerId: data.managerId || null,
      managerName: data.managerName || "",
      employeeCount: data.employeeCount,
      isActive: data.isActive ?? true,
      createdAt: Date.now(),
    };

    await docRef.set(newDepartment);

    // 🔄 Revalidate UI
    revalidatePath("/admin/departments");

    return {
      success: true,
      message: "Department created successfully",
      data: newDepartment,
    };
  } catch (error) {
    console.error("Add Department Error:", error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}