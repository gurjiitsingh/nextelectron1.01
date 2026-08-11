import { InventoryItemType } from "@/lib/types/InventoryItemType";
import { adminDb } from "@/lib/firebaseAdmin";
 


import { revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";

export const fetchInventoryItems = 
  async (): Promise<InventoryItemType[]> => {
    try {
      const snapshot = await adminDb
        .collection("inventoryItems")
        //.orderBy("createdAt", "desc")
        .get();

      const inventoryItems = snapshot.docs.map((doc) => {
        const data = doc.data();

      return {
  id: doc.id,

  name: data.name || "",

  sku: data.sku || "",

  barcode: data.barcode || "",

  consumptionUnit:
    data.consumptionUnit || "pcs",

  purchaseMappings:
    data.purchaseMappings || [],

    purchaseUnit: data.purchaseUnit || 'gm',
   purchaseUnitCost:data.purchaseUnitCost || 0, 

   conversionFactor: data.conversionFactor || 1,

  currentStock:
    Number(data.currentStock) || 0,

  minStock:
    Number(data.minStock) || 0,

  averageCost:
    Number(data.averageCost) || 0,

  stockValue:
    Number(data.stockValue) || 0,

  sellingPrice:
    Number(data.sellingPrice) || 0,

  categoryId:
    data.categoryId || "",

  supplierId:
    data.supplierId || "",

  supplierIds:
    data.supplierIds || [],

  isActive:
    data.isActive ?? true,

  createdAt:
    data.createdAt?.toDate?.().toISOString() || null,

  updatedAt:
    data.updatedAt?.toDate?.().toISOString() || null,
};
      }) as InventoryItemType[];

      return inventoryItems;
    } catch (error) {
      console.error(
        "❌ Error fetching inventory items:",
        error
      );

      return [];
    }
  }
 