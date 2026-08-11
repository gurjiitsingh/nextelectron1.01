"use server";
// app/(universal)/action/inventory/processSaleInventory.ts
import { revalidatePath, revalidateTag } from "next/cache";

type OrderItemType = {
  productId: string;
  quantity: number;
  name?: string;
};
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { applyInventoryMovement } from "./applyInventoryMovement";

export async function processSaleInventory(
  orderId: string,
  orderItems: OrderItemType[]
) {
  try {
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (const item of orderItems) {


      const productId = item.productId;
      const soldQty = Number(item.quantity) || 0;

      const productRef = adminDb.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        console.log("❌ Product not found:", productId);
        continue;
      }

      const productData = productDoc.data();
      const productMode = productData?.productMode;


      // ==================================================
      // 1. FINISHED STOCK PRODUCT (DIRECT SALE)
      // ==================================================
      if (productMode === "finished_stock") {
        
        console.log("📦 Stock managed product:", productData?.name);

        await adminDb.runTransaction(async (transaction) => {
          const freshProductDoc = await transaction.get(productRef);

          if (!freshProductDoc.exists) return;

          const freshProductData = freshProductDoc.data();

          const previousStock =
            Number(freshProductData?.currentStock) || 0;

          const allowNegativeStock =
            freshProductData?.allowNegativeStock ?? false;

          const newStock = previousStock - soldQty;

          if (newStock < 0 && !allowNegativeStock) {
            console.log(
              `❌ Not enough stock for ${freshProductData?.name}`
            );
            return;
          }

          // UPDATE PRODUCT STOCK
          transaction.update(productRef, {
            currentStock: newStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // ==================================================
          // ✅ ADD: FINISHED STOCK LEDGER ENTRY
          // ==================================================
          const finishedLedgerRef = adminDb
            .collection("stockLedgerFinished")
            .doc();

          transaction.set(finishedLedgerRef, {
            productId,
            productName: productData?.name || "",
            type: "SALE",
            direction: "OUT",

            qty: soldQty,
            beforeStock: previousStock,
            afterStock: newStock,

            referenceId: orderId,
            referenceType: "ORDER",

            source: "SYSTEM",
            createdBy: "system",
            createdAt: now,
          });

          console.log(
            `✅ Reduced product stock: ${freshProductData?.name}`
          );
        });

        continue;
      }

      // ==================================================
      // 2. RECIPE PRODUCT (RAW MATERIAL CONSUMPTION)
      // ==================================================

      const recipeSnapshot = await adminDb
        .collection("productRecipes")
        .where("productId", "==", productId)
        .get();

      if (!recipeSnapshot.empty) {
        console.log("🍳 Recipe live product:", productData?.name);

        for (const recipeDoc of recipeSnapshot.docs) {
          const recipeData = recipeDoc.data();

          const inventoryItemId = recipeData.inventoryItemId;
          const recipeQty = Number(recipeData.quantity) || 0;

          const deductQty = recipeQty * soldQty;

          // Read inventory only (no transaction)
          const inventorySnap = await adminDb
            .collection("inventoryItems")
            .doc(inventoryItemId)
            .get();

          if (!inventorySnap.exists) {
            console.log("❌ Inventory item missing:", inventoryItemId);
            continue;
          }

          const inventoryData = inventorySnap.data();

          // ==================================================
          // UPDATE INVENTORY + STOCK LEDGER
          // ==================================================
      //  await applyInventoryMovement({
      //       inventoryItemId,

      //       type: "CONSUMPTION",
      //       direction: "OUT",

      //       quantity: deductQty,

      //       unitCost:   0,

      //      purchaseQuantity: undefined,

      //       purchaseUnit:
      //         inventoryData?.purchaseUnit ??
      //         inventoryData?.consumptionUnit,

      //       // purchaseUnitCost:
      //       //   Number(inventoryData?.costPrice) || 0,

      //       conversionFactor:
      //         Number(inventoryData?.conversionFactor) || 1,

      //       supplierId: "",
      //       supplierName: "",

      //       totalAmount: 0,
      //       paidAmount: 0,
      //       dueAmount: 0,
      //       paymentStatus: "PAID",

      //       referenceId: orderId,
      //       referenceType: "ORDER",

      //       note: `Recipe consumption (${productData?.name})`,

      //       createdBy: "web store",
      //       source: "SYSTEM",
      //     });

          
        }

        continue;
      }
      // ==================================================
      // 3. SIMPLE PRODUCT
      // ==================================================
      console.log("🧾 Simple product:", productData?.name);

      await adminDb.runTransaction(async (transaction) => {
        const freshSnap = await transaction.get(productRef);

        if (!freshSnap.exists) return;

        const freshData = freshSnap.data();

        const previousStock = Number(freshData?.currentStock) || 0;
        const newStock = previousStock - soldQty;

        transaction.update(productRef, {
          currentStock: newStock,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // ==================================================
        // ✅ ADD: FINISHED LEDGER (SIMPLE PRODUCT ALSO)
        // ==================================================
        const finishedLedgerRef = adminDb
          .collection("stockLedgerFinished")
          .doc();

        transaction.set(finishedLedgerRef, {
          productId,
          productName: productData?.name || "",

          type: "SALE",
          direction: "OUT",

          qty: soldQty,
          beforeStock: previousStock,
          afterStock: newStock,

          referenceId: orderId,
          referenceType: "ORDER",

          source: "SYSTEM",
          createdBy: "system",
          createdAt: now,
        });
      });
    }

    return { success: true };
  } catch (error) {
    console.error("❌ processSaleInventory failed:", error);

    return {
      success: false,
      error: "Inventory processing failed",
    };
  }
}

 