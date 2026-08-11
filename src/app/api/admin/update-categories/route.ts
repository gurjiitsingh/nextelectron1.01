import { NextResponse } from "next/server";
import { updateAllProductsWithCategoryName } from "@/app/(universal)/action/dbUpdates/dbOperation";

export async function POST() {
  const result = await updateAllProductsWithCategoryName();
  return NextResponse.json(result);
}
