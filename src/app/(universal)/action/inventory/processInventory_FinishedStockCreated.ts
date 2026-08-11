// app/(universal)/action/inventory/processInventoryFinishedStockCreated.ts

"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import admin from "firebase-admin";

type OrderItemType = {
  id: string;
  quantity: number;
  name?: string;
};

export async function processInventory_FinishedStockCreated(
  orderId: string,
  orderItems: OrderItemType[]
) {
 

  try {
    for (const item of orderItems) {
      const productId = item.id;

      const producedQty =
        Number(item.quantity) || 0;

        console.log("product qty----------",producedQty)

      // ==================================================
      // GET PRODUCT
      // ==================================================

      const productDoc =
        await adminDb
          .collection("products")
          .doc(productId)
          .get();

          

      if (!productDoc.exists) {
        console.log(
          "❌ Product not found:",
          productId
        );



        continue;
      }

      const productData =
        productDoc.data();

      // ==================================================
      // ONLY STOCK MANAGED PRODUCTS
      // ==================================================

      if (
        productData?.productMode !==
        "finished_stock"
      ) {
        console.log(
          "⏭️ Skipping non stock managed product:",
          productData?.name
        );

        continue;
      }

      // ==================================================
      // FIND RECIPES
      // ==================================================

      const recipeSnapshot =
        await adminDb
          .collection("productRecipes")
          .where(
            "productId",
            "==",
            productId
          )
          .get();

      if (recipeSnapshot.empty) {
        console.log(
          "⚠️ No recipes found:",
          productData?.name
        );

        continue;
      }

      console.log(
        "🏭 Finished stock production:",
        productData?.name
      );

      // ==================================================
      // PROCESS ALL RECIPE ITEMS
      // ==================================================

      for (const recipeDoc of recipeSnapshot.docs) {
        const recipeData =
          recipeDoc.data();

        const inventoryItemId =
          recipeData.inventoryItemId;

        const recipeQty =
          Number(
            recipeData.quantity
          ) || 0;

        // TOTAL RAW MATERIAL USED
        const deductQty =
          recipeQty *
          producedQty;

        console.log(
          "production deduction-------------",
          {
            product:
              productData?.name,

            inventoryItemId,

            recipeQty,

            producedQty,

            deductQty,
          }
        );

        // ==================================================
        // INVENTORY REF
        // ==================================================

        const inventoryRef =
          adminDb
            .collection(
              "inventoryItems"
            )
            .doc(
              inventoryItemId
            );

        // ==================================================
        // TRANSACTION
        // ==================================================

        await adminDb.runTransaction(
          async (transaction) => {
            // GET INVENTORY
            const inventoryDoc =
              await transaction.get(
                inventoryRef
              );

            if (
              !inventoryDoc.exists
            ) {
              console.log(
                "❌ Inventory item missing:",
                inventoryItemId
              );

              return;
            }

            const inventoryData =
              inventoryDoc.data();

            const previousStock =
              Number(
                inventoryData?.currentStock
              ) || 0;

            // NEGATIVE STOCK CHECK
            const allowNegativeStock =
              productData?.allowNegativeStock ??
              false;

            const newStock =
              previousStock -
              deductQty;

            if (
              newStock < 0 &&
              !allowNegativeStock
            ) {
              console.log(
                `❌ Not enough stock for ${inventoryData?.name}`
              );

              return;
            }

            // ==================================================
            // UPDATE INVENTORY STOCK
            // ==================================================

            transaction.update(
              inventoryRef,
              {
                currentStock:
                  newStock,

                updatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              }
            );

            // ==================================================
            // INVENTORY TRANSACTION LOG
            // ==================================================

            const transactionRef =
              adminDb
                .collection(
                  "inventoryTransactions"
                )
                .doc();

            transaction.set(
              transactionRef,
              {
                inventoryItemId,

                inventoryItemName:
                  inventoryData?.name ||
                  "",

                type:
                  "production",

                quantity:
                  deductQty,

                previousStock,

                newStock,

                note: `Raw material used for finished stock creation (${productData?.name})`,

                referenceId:
                  orderId,

                referenceType:
                  "production",

                createdBy:
                  "system",

                createdAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              }
            );
          }
        );
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "❌ processInventoryFinishedStockCreated failed:",
      error
    );

    return {
      success: false,

      error:
        "Inventory processing failed",
    };
  }
}