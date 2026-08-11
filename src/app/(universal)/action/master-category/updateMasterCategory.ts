"use server";

import { upload } from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidateTag } from "next/cache";

export async function updateMasterCategory(
  id: string,
  formData: FormData
) {
  try {
    const name = formData.get("name");
    const description =
      formData.get("description");

    const sortOrder =
      Number(formData.get("sortOrder")) || 0;

    const icon = formData.get("icon");

    const isActive =
      formData.get("isActive");

      const image = formData.get("image");
const oldImageUrl = formData.get(
  "oldImageUrl"
) as string;

let imageUrl = oldImageUrl;

if (
  image &&
  typeof image !== "string"
) {
  try {
    imageUrl = await upload(image);
  } catch (error) {
    console.error(error);

    return {
      error: "Image upload failed",
    };
  }
}

    await adminDb
      .collection("masterCategories")
      .doc(id)
      .update({
        name,
        description,
        sortOrder,
        icon,
        isActive,
          image: imageUrl,
        updatedAt: Date.now(),
      });

    revalidateTag(
      "masterCategories",
      "max"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
    };
  }
}