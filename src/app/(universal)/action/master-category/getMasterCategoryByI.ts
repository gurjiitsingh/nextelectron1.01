"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getMasterCategoryById(
  id: string
) {
  const doc = await adminDb
    .collection("masterCategories")
    .doc(id)
    .get();

  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  };
}