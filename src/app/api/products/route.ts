import { NextResponse } from "next/server";
import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";

export async function GET() {
  try {
    const products = await fetchProducts();
  

    return NextResponse.json(products, {
      headers: {
        "x-next-cache-tags": "products",
      },
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}