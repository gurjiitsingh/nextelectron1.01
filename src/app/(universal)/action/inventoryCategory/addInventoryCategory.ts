"use server";



import { revalidatePath, revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function addInventoryCategory(
  formData: FormData
) {
  try {
    const name =
      (
        formData.get(
          "name"
        ) as string
      )?.trim() || "";

    const description =
      (
        formData.get(
          "description"
        ) as string
      )?.trim() || "";

    const sortOrder =
      Number(
        formData.get(
          "sortOrder"
        )
      ) || 0;

    const trackInventory =
      formData.get(
        "trackInventory"
      ) === "true";

    const allowNegativeStock =
      formData.get(
        "allowNegativeStock"
      ) === "true";

    const color =
      (
        formData.get(
          "color"
        ) as string
      )?.trim() || "";

    const icon =
      (
        formData.get(
          "icon"
        ) as string
      )?.trim() || "";

    const isActive =
      formData.get(
        "isActive"
      ) === "true";

    if (!name) {
      return {
        errors: {
          name:
            "Category name is required",
        },
      };
    }

    const normalizedName =
      name.toLowerCase();

    // Duplicate check
    const existingCategory =
      await adminDb
        .collection(
          "inventoryCategories"
        )
        .where(
          "nameLower",
          "==",
          normalizedName
        )
        .limit(1)
        .get();

    if (
      !existingCategory.empty
    ) {
      return {
        errors: {
          name:
            "Category already exists",
        },
      };
    }

    const data = {
      name,

      nameLower:
        normalizedName,

      description,

      sortOrder,

      trackInventory,

      allowNegativeStock,

      color,

      icon,

      isActive,

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef =
      await adminDb
        .collection(
          "inventoryCategories"
        )
        .add(data);

    revalidateTag(
      "inventory-categories",
      "max"
    );

    revalidatePath(
      "/admin/inventory/categories"
    );

    revalidatePath(
      "/admin/inventory/categories/new"
    );

    return {
      success: true,

      id: docRef.id,

      message:
        "Category created successfully",
    };
  } catch (error) {
    console.error(
      "❌ Category save failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not save category",
      },
    };
  }
}