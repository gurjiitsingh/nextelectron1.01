"use server";

import { categoryType } from "@/lib/types/categoryType";
import { categorySchema, editCategorySchema } from "@/lib/types/categoryType";
import { deleteImage, upload } from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function editCategory(formData: FormData) {
  console.log("form---------------", formData);

  const id = formData.get("id") as string;
  const image = formData.get("image");
  const name = formData.get("name");
  const desc = formData.get("desc");
  const oldImageUrl = formData.get("oldImageUrl") as string;
  const isFeatured = formData.get("isFeatured");
  const sortOrder = formData.get("sortOrder");

  // Master Category
  const masterCategoryId =
    (formData.get("masterCategoryId") as string) || "";

  // Tax
  const taxRateRaw = formData.get("taxRate") as string | null;
  const taxType =
    (formData.get("taxType") as string) ?? null;

  const taxRate = taxRateRaw
    ? parseFloat(taxRateRaw) || null
    : null;

  const receivedData = {
    id,
    oldImageUrl,
    name,
    desc,
    sortOrder,
    image,
    isFeatured,
    masterCategoryId,
  };

  const result =
    editCategorySchema.safeParse(receivedData);

  let zodErrors = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      zodErrors = {
        ...zodErrors,
        [issue.path[0]]: issue.message,
      };
    });

    return { errors: zodErrors };
  }

  // Fetch Master Category Name
  let masterCategoryName = "";

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
        "Failed to fetch master category:",
        error
      );
    }
  }

  let imageUrl = oldImageUrl;

if (
  image &&
  image !== "0" &&
  image !== "undefined"
) {
    try {
      // Upload new image
      imageUrl = await upload(image);

      // Delete old image
      if (
        oldImageUrl &&
        !oldImageUrl.includes("/com.jpg") &&
        !oldImageUrl.includes("/com-1.jpg")
      ) {
        const oldParts = oldImageUrl.split("/");

        const publicId = oldParts
          .slice(-2)
          .join("/")
          .split(".")[0];

        try {
          await deleteImage(publicId);

          console.log(
            "Old Cloudinary image deleted:",
            publicId
          );
        } catch (err) {
          console.error(
            "Failed to delete old image:",
            err
          );
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);

      return {
        errors: "Image could not be uploaded",
      };
    }
  }

  const categoryUpdateData = {
    name,
    desc,
    sortOrder,
    image: imageUrl,
    isFeatured,

    // Master Category
    masterCategoryId,
    masterCategoryName,

    // Tax
    taxRate,
    taxType,

    updatedAt: new Date().toISOString(),
  };

  try {
    await adminDb
      .collection("category")
      .doc(id)
      .set(categoryUpdateData, { merge: true });

  //  .update(categoryUpdateData);  // OR FOR UPDAT
    //   .set(categoryUpdateData);  //NOT FOR UPDATE

    revalidateTag("categories", "max");

    return {
      message: {
        success: "Category updated",
      },
    };
  } catch (error) {
    console.log("error", error);

    return {
      errors: "Cannot update",
    };
  }
}