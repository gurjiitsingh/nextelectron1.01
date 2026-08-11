// /app/api/products/addon/route.ts
import { fetchAddOnProducts } from "@/app/(universal)/action/productsaddon/dbOperation";
import { NextResponse } from "next/server";


export const revalidate = 0;

export async function GET() {
  try {
    const data = await fetchAddOnProducts();

    return NextResponse.json(
      { data },
      {
        headers: {
          "x-next-cache-tags": "addons",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: true, message: "Failed to load addons" });
  }
}
