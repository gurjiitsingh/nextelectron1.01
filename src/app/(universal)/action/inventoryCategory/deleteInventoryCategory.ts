"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebaseAdmin";

export async function deleteInventoryCategory(
  id: string
) {
  try {
    if (!id) {
      return {
        errors: {
          general: "Category ID is required",
        },
      };
    }


    const items = await adminDb
  .collection("inventoryItems")
  .where("categoryId", "==", id)
  .limit(1)
  .get();

if (!items.empty) {
  return {
    errors: {
      general:
        "Category is being used by inventory items",
    },
  };
}

    await adminDb
      .collection("inventoryCategories")
      .doc(id)
      .delete();

    revalidatePath(
      "/admin/inventory/categories"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Delete category error:",
      error
    );

    return {
      errors: {
        general:
          "Failed to delete category",
      },
    };
  }
}