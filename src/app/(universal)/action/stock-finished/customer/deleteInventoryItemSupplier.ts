"use server";

import {
  revalidatePath,
  revalidateTag,
} from "next/cache";

import {
  adminDb,
} from "@/lib/firebaseAdmin";

export async function deleteInventoryItemSupplier(
  id: string
) {
  try {
    if (!id) {
      return {
        errors: {
          general:
            "Mapping id is required",
        },
      };
    }

    const docRef =
      adminDb
        .collection(
          "inventoryItemSuppliers"
        )
        .doc(id);

    const doc =
      await docRef.get();

    if (!doc.exists) {
      return {
        errors: {
          general:
            "Customer mapping not found",
        },
      };
    }

    const data =
      doc.data();

    await docRef.delete();

    revalidateTag(
      "inventory-item-suppliers",
      "max"
    );

    revalidatePath(
      "/admin/stock-finished/items"
    );

    if (
      data?.inventoryItemId
    ) {
      revalidatePath(
        `/admin/stock-finished/items/edit/${data.inventoryItemId}`
      );
    }

    return {
      success: true,

      message:
        "Supplier removed successfully",
    };
  } catch (error) {
    console.error(
      "❌ Failed to delete supplier mapping:",
      error
    );

    return {
      errors: {
        general:
          "Could not remove supplier",
      },
    };
  }
}