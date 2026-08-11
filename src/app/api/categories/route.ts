import { NextResponse } from "next/server";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";

//export const revalidate = 30; //  Optional background revalidation

export async function GET() {
  try {
    const categories = await fetchCategories();

    categories.sort((a, b) => a.sortOrder! - b.sortOrder!);

    return NextResponse.json(categories, {
      status: 200,
      //  Tell Next.js this API belongs to the "categories" cache tag
      headers: { "x-next-cache-tags": "categories" },
    });
  } catch (error) {
    console.error("API /categories error:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
