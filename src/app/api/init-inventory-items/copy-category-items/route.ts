import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

import { fetchProductByCategoryId } from "@/app/(universal)/action/products/dbOperation";
import { mapProductToInventory } from "@/app/(universal)/action/stock-finished/init/mapProductToInventory";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      categoryId,
      inventoryCategoryId, // ✅ NEW (optional)
      purchaseUnit,
      consumptionUnit,
      conversionFactor,
      minStock,
      currentStock,
    } = body;

    // ✅ VALIDATION
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category required" },
        { status: 400 }
      );
    }

    const purchase = purchaseUnit?.toLowerCase() || "pcs";
    const consumption = consumptionUnit?.toLowerCase() || purchase;
    const factor = Number(conversionFactor) || 1;

    // ✅ FETCH PRODUCTS
    const products = await fetchProductByCategoryId(categoryId);

    const filtered = products.filter((p) => p.type === "parent");

    if (filtered.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No parent products found",
      });
    }

    const batch = adminDb.batch();

    filtered.forEach((product) => {
      const stock = mapProductToInventory(
        product,
        {
          purchaseUnit: purchase,
          consumptionUnit: consumption,
          conversionFactor: factor,
        },
        // ✅ USE inventoryCategoryId if provided, else fallback
        inventoryCategoryId || categoryId,
        minStock ?? 0,          // ✅ safe default
        currentStock ?? 0       // ✅ safe default
      );

    if (!stock.id) {
  console.warn("Missing stock id for product", product);
  return; // skip this item
}

const ref = adminDb
  .collection("inventoryItems")
  .doc(stock.id);

      batch.set(ref, stock, { merge: true });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      count: filtered.length,
    });

  } catch (error: any) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}