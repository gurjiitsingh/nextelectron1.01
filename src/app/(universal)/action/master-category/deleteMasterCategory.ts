"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function deleteMasterCategory(
  id: string
) {
  try {
    await adminDb
      .collection("masterCategories")
      .doc(id)
      .delete();

    revalidateTag(
      "masterCategories",
      "max"
    );

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
}