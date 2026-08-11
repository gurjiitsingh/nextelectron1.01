import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";
import { ProductType } from "@/lib/types/productType";
import {
  getConversionFactor,
  getDefaultUnitPair,
} from "@/utils/inventory/unitConversion";
import admin from "firebase-admin";

type UnitConfig = {
  purchaseUnit?: InventoryUnit;
  consumptionUnit?: InventoryUnit;
  conversionFactor?: number;
};

export function mapProductToInventory(
  product: ProductType,
  config?: UnitConfig,
  categoryId?: string,
  minStock?: number,
  currentStock?: number
): Partial<InventoryItemType> {
  const name = product.name ?? "";

  const defaultPair =
    getDefaultUnitPair(config?.purchaseUnit);

  const purchaseUnit =
    config?.purchaseUnit ??
    defaultPair?.purchaseUnit ??
    "pcs";

  const consumptionUnit =
    config?.consumptionUnit ??
    defaultPair?.consumptionUnit ??
    purchaseUnit;

  const conversionFactor =
    config?.conversionFactor ??
    getConversionFactor(
      purchaseUnit,
      consumptionUnit
    );

  return {
    id: product.id,

    name,
    nameLower: name.toLowerCase(),

    sku: product.sku ?? "",
    barcode: product.barcode ?? "",

     
    consumptionUnit,
    

    // ✅ NEW
    purchaseMappings: [
      {
        purchaseUnit,
        consumptionUnit,
        factor: conversionFactor,
      },
    ],

    currentStock: Number(currentStock ?? 0),
    minStock: Number(minStock ?? 0),

    ...(categoryId &&
      categoryId.trim() !== "" && {
        categoryId,
      }),

    ...(product.productCat && {
      categoryName: product.productCat,
    }),

    isActive: true,

    updatedAt:
      admin.firestore.FieldValue.serverTimestamp(),
  };
}