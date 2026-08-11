"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

import {
  ProductRecipeType,
  newProductRecipeSchema,
} from "@/lib/types/ProductRecipeType";

import { revalidatePath, revalidateTag } from "next/cache";

export async function addProductRecipe(
  formData: FormData
) {
   
console.log("data--------------",formData)
  try {
    // FORM VALUES
    const productId = formData.get(
      "productId"
    ) as string;

    const inventoryItemId =
      formData.get(
        "inventoryItemId"
      ) as string;

    const quantityRaw = formData.get(
      "quantity"
    ) as string | null;

    const unit = formData.get(
      "unit"
    ) as string;

    // SAFE NUMBER
    const quantity = quantityRaw
      ? parseFloat(quantityRaw)
      : 0;

    // VALIDATION OBJECT
    const receivedData = {
      productId,

      inventoryItemId,

      quantity,

      unit,
    };

    // ZOD VALIDATION
    const result =
      newProductRecipeSchema.safeParse(
        receivedData
      );

    if (!result.success) {
      const zodErrors: Record<
        string,
        string
      > = {};

      result.error.issues.forEach(
        (issue) => {
          zodErrors[
            issue.path[0]
          ] = issue.message;
        }
      );

      return {
        errors: zodErrors,
      };
    }

    // FETCH PRODUCT
    const productSnap =
      await adminDb
        .collection("productStock")
        .doc(productId)
        .get();

    if (!productSnap.exists) {
      return {
        errors: {
          product:
            "Product not found",
        },
      };
    }

    const productData =
      productSnap.data();

    // FETCH INVENTORY ITEM
    const inventorySnap =
      await adminDb
        .collection("inventoryItems")
        .doc(inventoryItemId)
        .get();

    if (!inventorySnap.exists) {
      return {
        errors: {
          inventory:
            "Inventory item not found",
        },
      };
    }

    const inventoryData =
      inventorySnap.data();

    // PREVENT DUPLICATE RECIPE
    const existingRecipe =
      await adminDb
        .collection("productRecipes")
        .where(
          "productId",
          "==",
          productId
        )
        .where(
          "inventoryItemId",
          "==",
          inventoryItemId
        )
        .limit(1)
        .get();

    if (!existingRecipe.empty) {
      return {
        errors: {
          duplicate:
            "Ingredient already added to recipe",
        },
      };
    }

    // FIRESTORE DATA
    const data: Omit<
      ProductRecipeType,
      "id"
    > = {
      productId,

      productName:
        productData?.name || "",

      inventoryItemId,

      inventoryItemName:
        inventoryData?.name || "",

      quantity,

      unit,

      createdAt:  admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log(
      "recipe data-------------",
      data
    );

    // SAVE
    const docRef = await adminDb
      .collection("productRecipes")
      .add(data);

    // REVALIDATE
    revalidateTag(
      "product-recipes",
      "max"
    );

    revalidatePath(
      "/admin/product-recipes"
    );

    revalidatePath(
      "/admin/product-recipes/form"
    );

    return {
      success: true,

      message:
        "Recipe ingredient added successfully",

      id: docRef.id,
    };
  } catch (error) {
    console.error(
      "❌ Product recipe save failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not save recipe ingredient",
      },
    };
  }
}


export async function fetchProductRecipes(): Promise<
  ProductRecipeType[]
> {
  try {
    const snapshot = await adminDb
      .collection("productRecipes")
      .orderBy("productName")
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<ProductRecipeType> & {
        createdAt?: any;
      };

      let createdAt: string | null = null;

      if (data.createdAt) {
        if (
          typeof data.createdAt.toDate ===
          "function"
        ) {
          createdAt =
            data.createdAt
              .toDate()
              .toISOString();
        } else if (
          typeof data.createdAt ===
          "string"
        ) {
          createdAt = data.createdAt;
        }
      }

      return {
        id: doc.id,

        productId:
          data.productId ?? "",

        productName:
          data.productName ?? "",

        inventoryItemId:
          data.inventoryItemId ?? "",

        inventoryItemName:
          data.inventoryItemName ??
          "",

        quantity:
          data.quantity ?? 0,

        unit: data.unit ?? "",

        createdAt,
      };
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch product recipes:",
      error
    );

    return [];
  }
}