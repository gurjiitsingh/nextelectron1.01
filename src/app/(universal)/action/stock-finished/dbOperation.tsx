"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryItemType, InventoryUnit, newInventorySchema } from "@/lib/types/InventoryItemType";
import admin from "firebase-admin";


import { revalidatePath, revalidateTag } from "next/cache";






import { cache } from "react";


// FETCH ALL INVENTORY ITEMS
export const fetchInventoryItems = cache(
  async (): Promise<InventoryItemType[]> => {
    try {
      const snapshot = await adminDb
        .collection("inventoryItems")
        .orderBy("createdAt", "desc")
        .get();

      const inventoryItems =
        snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,

            name: data.name || "",

            sku: data.sku || "",

            barcode: data.barcode || "",

            purchaseMappings:
              data.purchaseMappings ?? [
                {
                  purchaseUnit:
                    data.purchaseUnit || "pcs",
                  consumptionUnit:
                    data.consumptionUnit || "pcs",
                  factor:
                    data.conversionFactor || 1,
                },
              ],
purchaseUnit:data.purchaseUnit || "",
conversionFactor:data.conversionFactor || 1 ,
            consumptionUnit:
              data.consumptionUnit || "pcs",

            currentStock:
              data.currentStock || 0,

            minStock:
              data.minStock || 0,

            costPrice:
              data.costPrice || 0,

            sellingPrice:
              data.sellingPrice || 0,

            categoryId:
              data.categoryId || "",

            supplierId:
              data.supplierId || "",

            isActive:
              data.isActive ?? true,

            createdAt:
              data.createdAt?.toDate?.().toISOString() ||
              null,

            updatedAt:
              data.updatedAt?.toDate?.().toISOString() ||
              null,
          };
        }) as InventoryItemType[];

      return inventoryItems;
    } catch (error) {
      console.error(
        "❌ Error fetching inventory items:",
        error
      );

      return [];
    }
  }
);





export async function deleteInventoryItem(
  id: string
) {
  try {
    // ==========================
    // CHECK RECIPES
    // ==========================

    const recipeSnapshot =
      await adminDb
        .collection("productRecipes")
        .where(
          "inventoryItemId",
          "==",
          id
        )
        .limit(1)
        .get();

    if (!recipeSnapshot.empty) {
      return {
        success: false,
        message:
          "Inventory item is used in recipes. Remove recipes first.",
      };
    }

    // ==========================
    // CHECK TRANSACTIONS
    // ==========================

    const transactionSnapshot =
      await adminDb
        .collection(
          "inventoryTransactions"
        )
        .where(
          "inventoryItemId",
          "==",
          id
        )
        .limit(1)
        .get();

    if (
      !transactionSnapshot.empty
    ) {
      return {
        success: false,
        message:
          "Inventory item has transaction history and cannot be deleted.",
      };
    }

    // ==========================
    // DELETE INVENTORY
    // ==========================

    await adminDb
      .collection("inventoryItems")
      .doc(id)
      .delete();

    // ==========================
    // REVALIDATE
    // ==========================

    revalidateTag(
      "inventory-items",
      "max"
    );

    revalidatePath(
      "/admin/stock-finished/"
    );

    revalidatePath(
      "/admin/stock-finished/form"
    );

    revalidatePath(
      "/admin/stock-finished/editform"
    );

    return {
      success: true,
      message:
        "Inventory item deleted successfully",
    };
  } catch (error) {
    console.error(
      "❌ Error deleting inventory item:",
      error
    );

    return {
      success: false,
      message:
        "Failed to delete inventory item",
    };
  }
}






// FETCH SINGLE INVENTORY ITEM
export async function fetchInventoryItemById(
  id: string
): Promise<InventoryItemType | null> {

 
  try {
    const docRef = await adminDb
      .collection("inventoryItems")
      .doc(id)
      .get();

    if (!docRef.exists) {
      return null;
    }

    return {
      id: docRef.id,
      ...docRef.data(),
    } as InventoryItemType;
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item:",
      error
    );

    return null;
  }
}



export async function getInventoryItemById(
  id: string
): Promise<InventoryItemType | null> {
  try {
    const docRef = await adminDb
      .collection("inventoryItems")
      .doc(id)
      .get();

    if (!docRef.exists) {
      return null;
    }

    const data = docRef.data();

    return {
      id: docRef.id,

      ...data,

      createdAt: data?.createdAt
        ? data.createdAt.toMillis()
        : null,

      updatedAt: data?.updatedAt
        ? data.updatedAt.toMillis()
        : null,
    } as any;
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item:",
      error
    );

    return null;
  }
}

