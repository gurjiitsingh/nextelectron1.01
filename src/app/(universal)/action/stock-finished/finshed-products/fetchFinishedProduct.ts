"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";

import { newProductSchema, editProductSchema } from "@/lib/types/productType";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteImage, upload } from "@/lib/cloudinary";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { cache } from "react";

import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";



//  Cached version — reduces Firestore reads massively

import { unstable_cache } from "next/cache";

export const fetchFinishedProducts = unstable_cache(
  async (): Promise<ProductType[]> => {
    try {
      const snapshot = await adminDb
        .collection("products")
        .get();

      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<ProductType> & {
          updatedAt?: any;
        };

        let updatedAt: string | null = null;

        if (data.updatedAt) {
          if (
            typeof data.updatedAt.toDate ===
            "function"
          ) {
            updatedAt =
              data.updatedAt
                .toDate()
                .toISOString();
          } else if (
            typeof data.updatedAt ===
            "string"
          ) {
            updatedAt = data.updatedAt;
          }
        }

        return {
          id: doc.id,

          name: data.name ?? "",

          price: data.price ?? 0,

          currentStock:
            data.currentStock ?? 0,

            quantity:
  data.quantity ?? 0,

          discountPrice:
            data.discountPrice ?? 0,

          categoryId:
            data.categoryId ?? "",

          parentId:
            data.parentId ?? "",

           productMode:
  data.productMode === "finished_stock" ||
  data.productMode === "simple" ||
  data.productMode === "raw_stock"
    ? data.productMode
    : "raw_stock",

          hasVariants:
            data.hasVariants ?? false,

          hasModifier:
            data.hasModifier ?? false,

          type:
            data.type ?? "parent",

          productCat:
            data.productCat ?? "",

          flavors:
            data.flavors ?? false,

          publishStatus:
            data.publishStatus ??
            "published",

          stockStatus:
            data.stockStatus ??
            "out_of_stock",

          baseProductId:
            data.baseProductId ?? "",

          productDesc:
            data.productDesc ?? "",

          sortOrder:
            data.sortOrder ?? 0,

          image:
            data.image ?? "",

          isFeatured:
            data.isFeatured ?? false,

          purchaseSession:
            data.purchaseSession ??
            null,

         

          updatedAt,

          searchCode:
            data.searchCode ?? "",

          taxRate:
            data.taxRate ??
            undefined,

          taxType:
            data.taxType,
        };
      });
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );

      return [];
    }
  },

  // CACHE KEY
  ["all-products"],

  // OPTIONS
  {
       tags: ["products", "stock-products-updated"],

    // 1 hour cache
   // revalidate: 3600,
  }
);