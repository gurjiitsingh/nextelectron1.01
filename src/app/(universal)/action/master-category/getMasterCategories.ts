"use server";

import {
  masterCategorySchema,
  MasterCategoryType,
} from "@/lib/types/masterCategoryType";

import { upload } from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";


export async function getMasterCategories(): Promise<MasterCategoryType[]> {
  const snapshot = await adminDb
    .collection("masterCategories")
    .orderBy("sortOrder")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<MasterCategoryType, "id">),
  }));
}