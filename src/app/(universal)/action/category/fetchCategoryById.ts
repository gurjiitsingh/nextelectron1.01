"use server";

import { categorySchema, editCategorySchema } from "@/lib/types/categoryType";
import { deleteImage, upload } from "@/lib/cloudinary";
import { categoryType } from "@/lib/types/categoryType";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function fetchCategoryById(id: string): Promise<categoryType> {
  const docSnap = await adminDb.collection("category").doc(id).get();
  if (!docSnap.exists) {
    throw new Error("No such document!");
  }
  const category = { id: docSnap.id, ...docSnap.data() } as categoryType;
  return category;
}