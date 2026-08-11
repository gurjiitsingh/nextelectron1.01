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
          "suppliers"
        )
        .doc(id);

    const doc =
      await docRef.get();

    if (!doc.exists) {
      return {
        errors: {
          general:
            "Supplier mapping not found",
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
      "/admin/inventory/items"
    );

    if (
      data?.inventoryItemId
    ) {
      revalidatePath(
        `/admin/inventory/items/edit/${data.inventoryItemId}`
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