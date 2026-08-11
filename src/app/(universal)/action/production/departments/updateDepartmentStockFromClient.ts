"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function updateDepartmentStockFromClient({
  id,
  quantity,
  averageCost,
  stockValue,
}: {
  id: string;
  quantity: number;
  averageCost: number;
  stockValue: number;
}) {
  await adminDb
    .collection("departmentStock")
    .doc(id)
    .update({
      quantity,
      currentStock: quantity,
      averageCost,
      stockValue,
      updatedAt: new Date(),
    });
}