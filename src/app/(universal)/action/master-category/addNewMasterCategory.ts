"use server";

import {
  masterCategorySchema,
} from "@/lib/types/masterCategoryType";

import { upload } from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function addNewMasterCategory(
  formData: FormData
) {
  const name = formData.get("name");
  const description = formData.get("description");
  const sortOrder = formData.get("sortOrder");
  const image = formData.get("image");
  const icon = formData.get("icon");
  const isActive = formData.get("isActive");

  const receivedData = {
    name,
    description,
    sortOrder,
    image,
    icon,
    isActive,
  };

  const result =
    masterCategorySchema.safeParse(
      receivedData
    );

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

  let imageUrl = "";

  // Default image
  if (
    image === "0" ||
    !image
  ) {
    imageUrl = "/com-1.jpg";
  } else {
    try {
      imageUrl = await upload(image);
    } catch (error) {
      console.error(error);

      return {
        errors:
          "Image cannot be uploaded",
      };
    }
  }

  const data = {
    name,
    description,
    sortOrder: Number(sortOrder || 0),
    image: imageUrl,
    icon,
    isActive,
    createdAt: Date.now(),
  };

  try {
    const docRef = await adminDb
      .collection("masterCategories")
      .add(data);

    console.log(
      "Master Category Created:",
      docRef.id
    );

    revalidateTag(
      "masterCategories",
      "max"
    );

    return {
      message: {
        success:
          "Master Category Created Successfully",
      },
    };
  } catch (error) {
    console.error(error);

    return {
      errors:
        "Failed to create master category",
    };
  }
}