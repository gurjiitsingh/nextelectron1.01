"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";

import { newProductSchema, editProductSchema } from "@/lib/types/productType";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteImage, upload } from "@/lib/cloudinary";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { updateProductStockOnEdit } from "./updateProductStockOnEdit";
 

 

export async function editProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name");
  const type = formData.get("type") as string;
  const priceRaw = formData.get("price") as string;
  const discountPriceRaw = formData.get("discountPrice") as string;
  const currentStockS = formData.get("currentStock") as string;
  const sortOrderRaw = formData.get("sortOrder") as string;
  let categoryId = formData.get("categoryId") as string;
  const masterCategoryId =
    formData.get("masterCategoryId") as string;
  const productDesc = formData.get("productDesc");
  const oldImageUrl = formData.get("oldImageUrl") as string;
  const image = formData.get("image");
  const status = formData.get("status") || "published";
  const searchCode = formData.get("searchCode") as string | null;
  //  isFeatured now correctly handled
  const isFeaturedRaw = formData.get("isFeatured");
  const isFeatured =
    isFeaturedRaw === null
      ? undefined // means: not sent → don’t overwrite
      : isFeaturedRaw === "true";

  //  GST / tax fields
  const taxRateRaw = formData.get("taxRate") as string | null;
  const taxType = (formData.get("taxType") as string | null) ?? null;


 
  const publishStatus = (formData.get("status") as string) || "published";


  //  Validate received data
  const receivedData = {
    name,
    //searchCode,
    price: priceRaw,
    discountPrice: discountPriceRaw,
    currentStock: currentStockS,
    sortOrder: sortOrderRaw,
    categoryId,
    masterCategoryId,
    productDesc,
    image,
    publishStatus: "published",
  };

  const result = editProductSchema.safeParse(receivedData);

  if (!result.success) {
    console.log("❌ ZOD VALIDATION FAILED");

    result.error.issues.forEach((issue, index) => {
      console.log(`🔴 Issue ${index + 1}:`);
      console.log("Field:", issue.path.join("."));
      console.log("Message:", issue.message);
      //  console.log("Received Value:", issue.path.reduce((obj, key) => obj?.[key], receivedData));
    });

    const zodErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      zodErrors[issue.path[0]] = issue.message;
    });

    return { errors: zodErrors };
  }

  // 🔹 Fetch existing product

  const productRef = adminDb.collection("products").doc(id);
  const productSnap = await productRef.get();
  if (!productSnap.exists) {
    return { errors: "Product not found" };
  }

  const existingProduct = productSnap.data();




  // 🔸 Handle image upload
  // let imageUrl = oldImageUrl;
  // if (image && image !== "undefined") {
  //   try {
  //     imageUrl = await upload(image);
  //   } catch (error) {
  //     console.error("Image upload failed:", error);
  //     return { errors: "Image could not be uploaded" };
  //   }
  // } else {
  //   imageUrl = existingProduct?.image || oldImageUrl;
  // }

  // 🔸 Handle image upload + delete old image
  let imageUrl = oldImageUrl;

  if (image && image instanceof File) {
    try {
      //  Upload new image
      imageUrl = await upload(image);

      //  Delete old Cloudinary image (skip if default image)
      if (oldImageUrl && !oldImageUrl.includes("/com.jpg")) {
        const oldParts = oldImageUrl.split("/");
        const publicId = oldParts.slice(-2).join("/").split(".")[0];
        // ex: anjana-bhog/xyz123

        try {
          await deleteImage(publicId);
          console.log(" Old Cloudinary image deleted:", publicId);
        } catch (err) {
          console.error("❌ Failed to delete old image:", err);
        }
      }
    } catch (error: any) {
  console.error("Image upload failed");
  console.error(error);
  console.error(error?.message);
  console.error(error?.stack);

  return {
    errors: error?.message ?? "Image could not be uploaded",
  };
}
  } else {
    //  Keep old image if no new image uploaded
    imageUrl = existingProduct?.image || oldImageUrl;
  }

  // 🔸 Handle category (keep same if not changed)
  if (categoryId === "0" || !categoryId) {
    categoryId = existingProduct?.categoryId || "";
  }
  // Handle master category
  let masterCategoryName =
    existingProduct?.masterCategoryName || "";

  if (masterCategoryId) {
    try {
      const masterCategoryDoc = await adminDb
        .collection("masterCategories")
        .doc(masterCategoryId)
        .get();

      masterCategoryName =
        masterCategoryDoc.data()?.name || "";
    } catch (error) {
      console.error(
        "Error fetching master category:",
        error
      );
    }
  }

  // 🔹 Fetch category name
  let productCat = "Uncategorized";
  try {
    const categories = await fetchCategories();
    const matchedCategory = categories.find((cat) => cat.id === categoryId);
    if (matchedCategory) productCat = matchedCategory.name;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  // 🔸 Format numbers
  const formatPrice = (val: string): string =>
    Number(parseFloat(val.replace(/,/g, ".")).toFixed(2)).toFixed(2);

  const price = formatPrice(priceRaw);
  const discountPrice = discountPriceRaw
    ? formatPrice(discountPriceRaw)
    : "0.00";
  const sortOrder = parseInt(sortOrderRaw);

  //  Convert taxRate safely
  const taxRate = taxRateRaw ? parseFloat(taxRateRaw) || null : null;

  //  Build update data
  const productData: Record<string, any> = {
    name,
    type,
    searchCode,
    price,
    discountPrice,
    currentStock: Number(currentStockS),
    flavors: existingProduct?.flavors ?? false,
    sortOrder,
    categoryId,
    productCat,
    masterCategoryId,
    masterCategoryName,
    productDesc,
    image: imageUrl,
    status,
    updatedAt: new Date().toISOString(),
    taxRate,
    taxType: taxType ?? existingProduct?.taxType ?? null,
  };



  //  Only overwrite isFeatured if explicitly sent
  if (typeof isFeatured !== "undefined") {
    productData.isFeatured = isFeatured;
  } else {
    productData.isFeatured = existingProduct?.isFeatured ?? false;
  }

  try {
    await productRef.update(productData);

    // Convert price safely to number
    const sellingPriceNum = parseFloat(price);

    const stockRes = await updateProductStockOnEdit({
      id,
      name: name as string,
      categoryId,
      categoryName: productCat,
      sellingPrice: sellingPriceNum,
    });

   
  
    // CLEAR PRODUCT CACHE
    revalidateTag("products", "max");

    // OPTIONAL FEATURED CACHE
    revalidateTag("featured-products", "max");

    // OPTIONAL PAGE RELOADS
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");


    return { message: " Product updated successfully" };
  } catch (error) {
    console.error("❌ Failed to update product:", error);
    return { errors: "Failed to update product" };
  }
}