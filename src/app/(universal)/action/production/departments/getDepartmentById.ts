"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type Department = {
  id: string;
  name: string;
  code: string;
  description: string;

  employeeCount: number;

  managerId: string;
  managerName: string;

  type: string;
  isActive: boolean;

  purchaseMappings: {
    purchaseUnit: string;
    consumptionUnit: string;
    factor: number;
  }[];

  createdAt: number;
};

export async function getDepartmentById(
  departmentId: string
): Promise<Department | null> {
  try {
    const doc = await adminDb
      .collection("departments")
      .doc(departmentId)
      .get();

    if (!doc.exists) return null;

    const data = doc.data();

  return {
  id: data?.id ?? doc.id,

  name: data?.name ?? "",
  code: data?.code ?? "",
  description: data?.description ?? "",

  employeeCount: Number(data?.employeeCount ?? 0),

  managerId: data?.managerId ?? "",
  managerName: data?.managerName ?? "",

  type: data?.type ?? "",
  isActive: Boolean(data?.isActive ?? true),

  purchaseMappings: Array.isArray(data?.purchaseMappings)
    ? data.purchaseMappings.map((m: any) => ({
        purchaseUnit: m.purchaseUnit ?? "",
        consumptionUnit: m.consumptionUnit ?? "",
        factor: Number(m.factor ?? 1),
      }))
    : [],

  createdAt:
    data?.createdAt &&
    typeof data.createdAt.toMillis === "function"
      ? data.createdAt.toMillis()
      : Number(data?.createdAt ?? Date.now()),
};
  } catch (error) {
    console.error("Error fetching department:", error);
    return null;
  }
}