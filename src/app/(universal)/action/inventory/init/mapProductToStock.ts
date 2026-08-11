import { ProductType } from "@/lib/types/productType";

export type ProductStock = {
  id: string;
  name: string;
  price: number;

  productMode?: "raw_stock" | "finished_stock" | "simple";

  currentStock: number;
  minStock: number;

  categoryId?: string;
  categoryName?: string;

  sku?: string;
  barcode?: string;

  updatedAt: number;
};

export function mapProductToStock(
  product: ProductType
): ProductStock {
  return {
    // ✅ IMPORTANT: keep same ID as product
    id: product.id,

    name: product.name ?? "",

    price: product.price ?? 0,

    // ✅ fallback to safe value
    productMode: product.productMode ?? "simple",

    // ✅ do NOT override stock if already exists (handled by merge in DB)
    currentStock: product.currentStock ?? 0,

    minStock: product.minStock ?? 0,

    categoryId: product.categoryId ?? "",

    // 👇 UI friendly
    categoryName: product.productCat ?? "",

    sku: product.sku ?? "",

    barcode: product.barcode ?? "",

    updatedAt: Date.now(),
  };
}