import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const categorySnap = await adminDb.collection("categories").get();
    const productSnap = await adminDb.collection("products").get();

    const categories = categorySnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    const products = productSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ categories, products });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
