import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";
import { fetchAddOnProducts } from "@/app/(universal)/action/productsaddon/dbOperation";


export async function GET() {
  const [products, categories, addons] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchAddOnProducts()
  ]);

  return Response.json({ products, categories, addons });
}
