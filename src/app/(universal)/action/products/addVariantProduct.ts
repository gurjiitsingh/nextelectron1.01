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




export type ProductSearchType = {
  id: string;

  name: string;

  price: number;

  currentStock: number;

  type: string;

  productCat: string;

  image: string;

  searchCode: string;

  updatedAt: number;
};

//  Cached version — reduces Firestore reads massively

import { unstable_cache } from "next/cache";
import { deleteRecipesByProductId } from "../productRecipes/deleteRecipesByProductId";
import { addProductStock } from "./addProductsStock";
import { updateProductStockOnEdit } from "./updateProductStockOnEdit";
import { deleteProductStock } from "./deleteProductStock";
import { updateProductType } from "./dbOperation";




export async function addVariantProduct(formData: FormData) {

  try {
    const rawHasVariants = formData.get("hasVariants");

    // FINAL, SAFE conversion
    const hasVariants = rawHasVariants === "true";
    const type = formData.get("type") as string;
    const parentId = formData.get("parentId") as string;
    const featured_img = formData.get("isFeatured") === "true";
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const discountPrice = formData.get("discountPrice") as string;
    const sortOrder = formData.get("sortOrder") as string;
    const categoryId = formData.get("categoryId") as string;

    const productDesc = formData.get("productDesc") as string;
    const image = formData.get("image");
    const status = formData.get("status") as
      | "published"
      | "draft"
      | "out_of_stock";
    const currentStockRaw = formData.get("currentStock") as string | null;

    //  New tax fields
    const taxRateRaw = formData.get("taxRate") as string | null;
    const taxType = formData.get("taxType") as string | null;
    const searchCode = formData.get("searchCode") as string | null;
    const currentStock = currentStockRaw ? parseInt(currentStockRaw, 10) : null;
    const priceF = parseFloat(price.replace(/,/g, ".")) || 0;
    const discountPriceF = parseFloat(discountPrice.replace(/,/g, ".")) || 0;
    const sortOrderN = parseInt(sortOrder || "0", 10);
    const taxRate = taxRateRaw ? parseFloat(taxRateRaw) : null;
    const masterCategoryId = formData.get("masterCategoryId") as string | null;
    const productMode =
      (formData.get("productMode") as string) || "finished_stock";

    const sellingUnit =
      (formData.get("sellingUnit") as string) || "kg";

const debugData = {
  rawHasVariants,
  hasVariants,
  type,
  parentId,
  featured_img,
  name,
  price,
  discountPrice,
  sortOrder,
  categoryId,
  productDesc,
  image,
  status,
  currentStockRaw,
  currentStock,
  taxRateRaw,
  taxRate,
  taxType,
  searchCode,
  masterCategoryId,
  productMode,
};

console.log("📦 FULL FORM DATA:", debugData);

// Highlight problematic fields
Object.entries(debugData).forEach(([key, value]) => {
  if (value === undefined || value === null || value === "") {
    console.warn(`⚠️ Field issue → ${key}:`, value);
  }
});


    let masterCategoryName = "";

    if (masterCategoryId) {
      const masterCategoryDoc = await adminDb
        .collection("masterCategories")
        .doc(masterCategoryId)
        .get();

      masterCategoryName =
        masterCategoryDoc.data()?.name || "";
    }

    const receivedData = {
      name,
      searchCode,
      price: priceF,
      discountPrice: discountPriceF,
      currentStock,
      sortOrder: sortOrderN,
      categoryId,
      masterCategoryId,
      productDesc,
      image,
      isFeatured: featured_img,
      status,
      taxRate,
      taxType,
    };

    const result = newProductSchema.safeParse(receivedData);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return { errors: zodErrors };
    }

    //  Upload image
    let imageUrl = "/com.jpg";
    if (image && image !== "0") {
      try {
        imageUrl = await upload(image);
      } catch (error) {
        return { errors: { image: "Image upload failed" } };
      }
    }

    //  Fetch category name
    let productCat = "Uncategorized";
    try {
      const categories = await fetchCategories();
      const matchedCategory = categories.find((cat) => cat.id === categoryId);
      if (matchedCategory) productCat = matchedCategory.name;
    } catch (error) {
      console.error("Error fetching categories:", error);
    }

    //  Prepare Firestore document
    const data = {
      name,
      searchCode,
      price: priceF,
      discountPrice: discountPriceF,
      currentStock,
      sortOrder: sortOrderN,
      categoryId,
      parentId,
      hasVariants,
      type,
      productCat,
      masterCategoryId,
      masterCategoryName,
      productDesc,
      image: image ? imageUrl : null,
      isFeatured: featured_img,
      flavors: false,
      status,
      baseProductId: "",
      purchaseSession: null,
      quantity: null,
      taxRate,
      taxType,
      createdAt: new Date().toISOString(),
    };



    //  Save to Firestore

    const docRef = await adminDb.collection("products").add(data);


    await addProductStock({
      id: docRef.id, // ✅ SAME ID

      name,
      productMode: productMode as
        | "raw_stock"
        | "finished_stock"
        | "simple",

      sellingPrice: priceF,
      costPrice: priceF, // default

      sellingUnit,

      categoryId,
      categoryName: productCat,
    });



    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");
    revalidateTag("stock-products-updated", "max");
    //    REVALIDATE ALL PRODUCT PAGES
    revalidatePath("/"); // storefront home
    revalidatePath("/products"); // storefront products page
    revalidatePath("/admin/products"); // admin product list




    if (type == "variant") {
      updateProductType(parentId, "parent", true);
    }

    return { 
      success: true,
      message: "Product saved successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error("❌ Firestore add failed:", error);
    return { errors: { general: "Could not save product" } };
  }
}