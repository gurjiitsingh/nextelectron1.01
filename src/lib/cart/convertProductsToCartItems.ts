import { CartItem } from "../types/cartDataType";
import { ProductType } from "../types/productType";

export function convertProductsToCartItems(products: ProductType[]): CartItem[] {
  return products.map((p) => ({
    id: p.id ?? "",
    name: p.name,
    price: p.price,
    quantity: p.quantity ?? 1,
    currentStock: p.currentStock ?? 0,
    categoryId: p.categoryId,
    productCat: p.productCat ?? "",
    taxRate: p.taxRate,
    taxType: p.taxType,
    image: p.image
  }));
}

export type MinimalProductForPOS = {
  id?: string;
  name: string;
  price: number;
  quantity?: number | null;
  currentStock?: number | null;
  categoryId: string;
  productCat?: string;
  taxRate?: number;
  taxType?: "inclusive" | "exclusive";
  image: string;
};

export function convertProductsToCartItemsPOS(
  products: MinimalProductForPOS[]
): CartItem[] {
  return products.map((p) => ({
    id: p.id ?? "",
    name: p.name,
    price: p.price,
    quantity: p.quantity ?? 1,
    currentStock: p.currentStock ?? 0,
    categoryId: p.categoryId,
    productCat: p.productCat ?? "",
    taxRate: p.taxRate,
    taxType: p.taxType,
    image: p.image,
  }));
}