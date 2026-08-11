"use server";

import { categoryType } from "@/lib/types/categoryType";
import { adminDb } from "@/lib/firebaseAdmin";

export async function fetchCategoriesByMasterCategory(
  masterCategoryId: string
): Promise<categoryType[]> {
  try {
    const categorySnap = await adminDb
      .collection("category")
      .where(
        "masterCategoryId",
        "==",
        masterCategoryId
      )
      .get();

    const categories = categorySnap.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    ) as categoryType[];

    categories.sort(
      (a, b) =>
        Number(a.sortOrder || 0) -
        Number(b.sortOrder || 0)
    );

    return categories;
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error
    );

    return [];
  }
}