"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { cartProductType } from "@/lib/types/cartDataType";

type StockCheckResult = {
  success: boolean;
  message?: string;
};

export async function checkStockAvailabilityV2(
  cartData: cartProductType[]
): Promise<StockCheckResult> {
  try {
    const insufficient: string[] = [];

    for (const cartItem of cartData) {
      const productId = cartItem.id;

      const orderedQty =
        Number(cartItem.quantity) || 0;

      if (!productId || orderedQty <= 0) {
        continue;
      }

      // =====================================================
      // GET PRODUCT
      // =====================================================

      const productRef = adminDb
        .collection("products")
        .doc(productId);

      const productSnap =
        await productRef.get();

      if (!productSnap.exists) {
        insufficient.push(
          `${cartItem.name} (Product not found)`
        );

        continue;
      }

      const product =
        productSnap.data();

      const productName =
        product?.name || cartItem.name;

      const productMode =
        product?.productMode || "simple";

      const allowNegativeStock =
        product?.allowNegativeStock === true;

      // =====================================================
      // SIMPLE PRODUCT
      // =====================================================

      if (productMode === "simple") {
        const currentStock =
          Number(product?.currentStock) || 0;

        // BLOCK ONLY IF NEGATIVE STOCK DISABLED
        if (
          !allowNegativeStock &&
          orderedQty > currentStock
        ) {
          insufficient.push(
            `${productName} (Only ${currentStock} left)`
          );
        }

        continue;
      }

      // =====================================================
      // RECIPE PRODUCT
      // =====================================================

      const recipeSnapshot =
        await adminDb
          .collection("productRecipes")
          .where(
            "productId",
            "==",
            productId
          )
          .get();

      // NO RECIPE FOUND
      if (recipeSnapshot.empty) {
        insufficient.push(
          `${productName} (Recipe missing)`
        );

        continue;
      }

      // CHECK EVERY INGREDIENT
      for (const recipeDoc of recipeSnapshot.docs) {
        const recipe =
          recipeDoc.data();

        const inventoryItemId =
          recipe.inventoryItemId;

        const recipeQty =
          Number(recipe.quantity) || 0;

        const requiredQty =
          recipeQty * orderedQty;

        // GET INVENTORY ITEM
        const inventoryRef =
          adminDb
            .collection(
              "inventoryItems"
            )
            .doc(inventoryItemId);

        const inventorySnap =
          await inventoryRef.get();

        if (!inventorySnap.exists) {
          insufficient.push(
            `${productName} (Inventory item missing)`
          );

          continue;
        }

        const inventory =
          inventorySnap.data();

        const currentStock =
          Number(
            inventory?.currentStock
          ) || 0;

        const inventoryName =
          inventory?.name || "Inventory";

        // BLOCK ONLY IF NEGATIVE STOCK DISABLED
        if (
          !allowNegativeStock &&
          requiredQty > currentStock
        ) {
          insufficient.push(
            `${productName} → ${inventoryName} (Need ${requiredQty}, Available ${currentStock})`
          );
        }
      }
    }

    // =====================================================
    // FINAL RESULT
    // =====================================================

    if (insufficient.length > 0) {
      return {
        success: false,

        message:
          "Insufficient stock:\n" +
          insufficient.join("\n"),
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "❌ checkStockAvailabilityV2 failed:",
      error
    );

    return {
      success: false,

      message:
        "Could not validate stock",
    };
  }
}