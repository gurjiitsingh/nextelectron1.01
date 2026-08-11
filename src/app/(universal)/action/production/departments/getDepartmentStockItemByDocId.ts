"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export type DepartmentStockType = {
  id: string;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;
currentStock: number,
  averageCost: number;

  purchaseUnit: string;
  purchaseUnitCost: number;

  consumptionUnit: string;
  conversionFactor: number;

  stockValue: number;

  updatedAt: number;
};

export async function getDepartmentStockItemByDocId(
  id: string
): Promise<DepartmentStockType | null> {
  const doc = await adminDb
    .collection("departmentStock")
    .doc(id)
    .get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;

  return {
    id: doc.id,

    departmentId: data.departmentId || "",

    inventoryItemId: data.inventoryItemId || "",
    inventoryItemName: data.inventoryItemName || "",

    quantity: Number(data.quantity) || 0,
currentStock: Number(data.currentStock ?? 0),
    averageCost: Number(data.averageCost) || 0,

    purchaseUnit: data.purchaseUnit || "",
    purchaseUnitCost: Number(data.purchaseUnitCost) || 0,

    consumptionUnit: data.consumptionUnit || "",
    conversionFactor: Number(data.conversionFactor) || 1,

    stockValue: Number(data.stockValue) || 0,

    updatedAt:
      data.updatedAt?.toMillis?.() ?? 0,
  };
}