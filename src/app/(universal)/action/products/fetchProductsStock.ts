"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { ProductStock } from "@/lib/types/productStockType";

export async function fetchProductsStock(): Promise<ProductStock[]> {
  
  try {
    const snapshot = await adminDb
      .collection("productStock")
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as ProductStock;

       

      return {
        id: doc.id,

        // SNAPSHOT
        name: data.name ?? "",
        categoryId: data.categoryId ?? "",
        categoryName: data.categoryName ?? "",

        // INVENTORY
        productMode: data.productMode ?? "simple",
        currentStock: data.currentStock ?? 0,
        minStock: data.minStock ?? 0,

        // TRACKING
        sku: data.sku ?? "",
        barcode: data.barcode ?? "",

        // PRICING
        sellingPrice: data.sellingPrice ?? 0,
       wholesalePrice: data.wholesalePrice ?? undefined,
        costPrice: data.costPrice ?? 0,
        avgCost: data.avgCost ??  0,

        // UNIT
        sellingUnit: data.sellingUnit ?? "kg",

        // CONTROL
        priceSyncEnabled: data.priceSyncEnabled ?? true,
        trackInventory: data.trackInventory ?? true,
        allowNegativeStock:
          data.allowNegativeStock ?? false,

        // META
updatedAt:
  data.updatedAt &&
  typeof data.updatedAt === "object" &&
  typeof (data.updatedAt as any).toMillis === "function"
    ? (data.updatedAt as any).toMillis()
    : typeof data.updatedAt === "number"
    ? data.updatedAt
    : Date.now(),
// updatedAt: data.updatedAt?.toDate().toISOString() || '',

      };
    });
  } catch (error) {
    console.error("❌ Failed to fetch product stock:", error);
    return [];
  }
}