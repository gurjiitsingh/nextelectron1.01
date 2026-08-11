"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType } from "@/lib/types/InventoryItemType";

export const fetchInventoryItemsRepair =  
  async (): Promise<InventoryItemType[]> => {
    try {
      const snapshot = await adminDb
        .collection("inventoryItems")
        .get();

      const inventoryItems = snapshot.docs.map((doc) => {
        const data = doc.data();

        const purchaseMappings = Array.isArray(
          data.purchaseMappings
        )
          ? data.purchaseMappings.map((mapping: any) => ({
              purchaseUnit:
                mapping.purchaseUnit ||
                data.purchaseUnit ||
                data.consumptionUnit ||
                "pcs",

              consumptionUnit:
                mapping.consumptionUnit ||
                data.consumptionUnit ||
                "pcs",

              factor:
                Number(mapping.factor) || 1,
            }))
          : [];

        return {
          id: doc.id,

          name: data.name || "",

          sku: data.sku || "",

          barcode: data.barcode || "",

          consumptionUnit:
            data.consumptionUnit || "pcs",

          purchaseMappings,

          currentStock:
            Number(data.currentStock) || 0,

          minStock:
            Number(data.minStock) || 0,

          averageCost:
            Number(data.averageCost) || 0,
conversionFactor:
            Number(data.conversionFactor) || 0,
          purchaseUnit: data.purchaseUnit,
 purchaseUnitCost:
            Number(data.purchaseUnitCost) || 0,
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
            data.createdAt?.toDate?.().toISOString() ||
            null,

          updatedAt:
            data.updatedAt?.toDate?.().toISOString() ||
            null,
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
