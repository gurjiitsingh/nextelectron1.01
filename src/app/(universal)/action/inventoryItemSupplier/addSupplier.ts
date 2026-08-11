"use server";



import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function addSupplier(
  formData: FormData
) {
    try {
    const companyName =
      (
        formData.get(
          "companyName"
        ) as string
      )?.trim() || "";

    const contactPerson =
      (
        formData.get(
          "contactPerson"
        ) as string
      )?.trim() || "";

    const phone =
      (
        formData.get(
          "phone"
        ) as string
      )?.trim() || "";

    const email =
      (
        formData.get(
          "email"
        ) as string
      )?.trim() || "";

    const address =
      (
        formData.get(
          "address"
        ) as string
      )?.trim() || "";

    const city =
      (
        formData.get(
          "city"
        ) as string
      )?.trim() || "";

    const state =
      (
        formData.get(
          "state"
        ) as string
      )?.trim() || "";

    const pincode =
      (
        formData.get(
          "pincode"
        ) as string
      )?.trim() || "";

    const gstNumber =
      (
        formData.get(
          "gstNumber"
        ) as string
      )?.trim() || "";

    const panNumber =
      (
        formData.get(
          "panNumber"
        ) as string
      )?.trim() || "";

    const fssaiLicenseNumber =
      (
        formData.get(
          "fssaiLicenseNumber"
        ) as string
      )?.trim() || "";

    const type =
      (
        formData.get(
          "type"
        ) as string
      )?.trim() || "purchase";

    const notes =
      (
        formData.get(
          "notes"
        ) as string
      )?.trim() || "";

    const taxCollectedAtSource =
      formData.get(
        "taxCollectedAtSource"
      ) === "true";

    const isActive =
      formData.get(
        "isActive"
      ) === "true";

    // Validation
    if (!companyName) {
      return {
        errors: {
          companyName:
            "Company name is required",
        },
      };
    }    if (!contactPerson) {
              return {
        errors: {
          contactPerson:
            "Contact person is required",
          general: "Invalid payment data",
        },
      };
    }
       if (!phone) {
      return {
        errors: {
          phone:
            "Phone number is required",
        },
      };
       }

    const companyNameLower =
      companyName.toLowerCase();

    // Duplicate check
    const existingSupplier =
      await adminDb
        .collection(
          "suppliers"
        )
        .where(
          "companyNameLower",
          "==",
          companyNameLower
        )
        .limit(1)
        .get();

    if (
      !existingSupplier.empty
    ) {
           return {
        errors: {
          companyName:
            "Supplier already exists",
             },
      };
    }
      const data = {
      companyName,
      
      companyNameLower,
          contactPerson,
             phone,
             email,
                address,
                city,

      state,

      pincode,

      gstNumber,

      panNumber,

      fssaiLicenseNumber,

      type,

      taxCollectedAtSource,

      notes,

      isActive,
           createdAt:
        admin.firestore.FieldValue.serverTimestamp(),
           updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef =
      await adminDb
        .collection(
          "suppliers"
        )
        .add(data);

    revalidateTag(
      "suppliers",
      "max"
    );

    revalidatePath(
      "/admin/inventory/supplier"
    );

    revalidatePath(
      "/admin/inventory/supplier/add"
    );
    
    return {
      success: true,

      id: docRef.id,

      message:
        "Supplier created successfully",
    
    };
  } catch (error) {
    console.error(
      "❌ Supplier save failed:",
      error
    );
   

    return {
      errors: {
        general:
          "Could not save supplier",

            },
    };
  }

}