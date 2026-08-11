// /api/inventory/categories/route.ts

import { NextResponse } from "next/server";
import { fetchInventoryCategories } from "@/app/(universal)/action/inventoryCategory/fetchInventoryCategories";

export async function GET() {
  try {
    const data = await fetchInventoryCategories();
console.log("data--------------",data)

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}