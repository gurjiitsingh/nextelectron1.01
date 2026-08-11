import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";


import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";
import { mapProductToStock } from "@/app/(universal)/action/inventory/init/mapProductToStock";

export async function POST(req: Request) {
  // try {
  //   const body = await req.json();
  //   const { categoryId } = body;

  //   if (!categoryId) {
  //     return NextResponse.json(
  //       { success: false, message: "Category required" },
  //       { status: 400 }
  //     );
  //   }

  //   const products = await fetchProducts();

  //   let filtered = products.filter(
  //     (p) =>
  //       String(p.categoryId) === String(categoryId) &&
  //       p.type === "parent"
  //   );

  //   const batch = adminDb.batch();

  //   filtered.forEach((product) => {
  //     const stock = mapProductToStock(product);

  //     const ref = adminDb
  //       .collection("productStock")
  //       .doc(stock.id);

  //     batch.set(ref, stock, { merge: true });
  //   });

  //   await batch.commit();

  //   return NextResponse.json({
  //     success: true,
  //     count: filtered.length,
  //   });
  // } catch (error: any) {
  //   console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
      //  message: error.message,
      },
      { status: 500 }
    );
 // }
}