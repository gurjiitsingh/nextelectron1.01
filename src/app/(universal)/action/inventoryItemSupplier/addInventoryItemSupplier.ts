"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function addInventoryItemSupplier(
  formData: FormData
) {
  try {
    const inventoryItemId =
      (
        formData.get(
          "inventoryItemId"
        ) as string
      )?.trim() || "";

    const supplierId =
      (
        formData.get(
          "supplierId"
        ) as string
      )?.trim() || "";

    const preferred =
      formData.get(
        "preferred"
      ) === "true";

    const isActive =
      formData.get(
        "isActive"
      ) === "true";

    // Validation
    if (
      !inventoryItemId
    ) {
      return {
        errors: {
          inventoryItemId:
            "Inventory item is required",
        },
      };
    }

    if (!supplierId) {
      return {
        errors: {
          supplierId:
            "Supplier is required",
        },
      };
    }

    // Check item exists
    const itemDoc =
      await adminDb
        .collection(
          "inventoryItems"
        )
        .doc(
          inventoryItemId
        )
        .get();

    if (
      !itemDoc.exists
    ) {
      return {
        errors: {
          inventoryItemId:
            "Inventory item not found",
        },
      };
    }

    // Check supplier exists
    const supplierDoc =
      await adminDb
        .collection(
          "suppliers"
        )
        .doc(
          supplierId
        )
        .get();

    if (
      !supplierDoc.exists
    ) {
      return {
        errors: {
          supplierId:
            "Supplier not found",
        },
      };
    }

    // Prevent duplicate mapping
    const existing =
      await adminDb
        .collection(
          "inventoryItemSuppliers"
        )
        .where(
          "inventoryItemId",
          "==",
          inventoryItemId
        )
        .where(
          "supplierId",
          "==",
          supplierId
        )
        .limit(1)
        .get();

    if (
      !existing.empty
    ) {
      return {
        errors: {
          supplierId:
            "Supplier already linked to this inventory item",
        },
      };
    }

    // If preferred, remove preferred flag
    // from other suppliers of same item
    if (preferred) {
      const existingMappings =
        await adminDb
          .collection(
            "inventoryItemSuppliers"
          )
          .where(
            "inventoryItemId",
            "==",
            inventoryItemId
          )
          .get();

      const batch =
        adminDb.batch();

      existingMappings.docs.forEach(
        (doc) => {
          batch.update(
            doc.ref,
            {
              preferred:
                false,
            }
          );
        }
      );

      await batch.commit();
    }

    const data = {
      inventoryItemId,

      supplierId,

      preferred,

      isActive,

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef =
      await adminDb
        .collection(
          "inventoryItemSuppliers"
        )
        .add(data);

    revalidateTag(
      "inventory-item-suppliers",
      "max"
    );

    revalidatePath(
      "/admin/inventory/items"
    );

    return {
      success: true,

      id: docRef.id,

      message:
        "Supplier linked successfully",
    };
  } catch (error) {
    console.error(
      "❌ Failed to link supplier:",
      error
    );

    return {
      errors: {
        general:
          "Could not link supplier",
      },
    };
  }
}