import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, productMode } = body;

     

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Product ID required",
      });
    }

    await adminDb
      .collection("products")
      .doc(id)
      .update({
        productMode,
        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    // Invalidate cached products
    //revalidateTag("stock-products-updated", "max");
revalidateTag("stock-products-updated", "max");
revalidatePath("/admin/stock-finshed");
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
    });
  }
}