"use server";

import { categorySchema, editCategorySchema } from "@/lib/types/categoryType";
import { deleteImage, upload } from "@/lib/cloudinary";
import { categoryType } from "@/lib/types/categoryType";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function fetchCategories(): Promise<categoryType[]> {
  const snapshot = await adminDb.collection("category").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
       masterCategoryId:
            data.masterCategoryId ?? "",

          masterCategoryName:
            data.masterCategoryName ?? "",
      desc: data.desc,
      productDesc: data.productDesc,
      slug: data.slug,
      image: data.image,
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      disablePickupDiscount: data.disablePickupDiscount,
       // tax fields
        taxRate: data.taxRate ,
        taxType: data.taxType ,
    } as categoryType;
  });
}