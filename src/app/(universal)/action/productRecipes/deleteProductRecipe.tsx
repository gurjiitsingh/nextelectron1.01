"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteProductRecipe(
  id: string
) {
  console.log("product recipe delete-------------");

  try {
    if (!id) {
      return {
        errors: {
          id: "Recipe ID is required",
        },
      };
    }

    // CHECK EXISTENCE (optional but clean)
    const docRef = adminDb
      .collection("productRecipes")
      .doc(id);

    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        errors: {
          notFound:
            "Recipe item not found",
        },
      };
    }

    // DELETE
    await docRef.delete();

    // REVALIDATE (same as add)
    revalidateTag("product-recipes", "max");

    revalidatePath(
      "/admin/product-recipes"
    );

    revalidatePath(
      "/admin/product-recipes/form"
    );

    return {
      success: true,
      message:
        "Recipe ingredient deleted successfully",
    };
  } catch (error) {
    console.error(
      "❌ Product recipe delete failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not delete recipe ingredient",
      },
    };
  }
}