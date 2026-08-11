"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function updateSupplier(
  id: string,
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
    }

    if (!contactPerson) {
      return {
        errors: {
          contactPerson:
            "Contact person is required",
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

    const supplierRef =
      adminDb
        .collection(
          "wholesaleCutomer"
        )
        .doc(id);

    const supplierDoc =
      await supplierRef.get();

    if (
      !supplierDoc.exists
    ) {
      return {
        errors: {
          general:
            "Supplier not found",
        },
      };
    }

    const companyNameLower =
      companyName.toLowerCase();

    // Duplicate check excluding current supplier
    const existingCustomer =
      await adminDb
        .collection(
          "wholesaleCutomer"
        )
        .where(
          "companyNameLower",
          "==",
          companyNameLower
        )
        .get();

    const duplicate =
      existingCustomer.docs.find(
        (doc) =>
          doc.id !== id
      );

    if (
      duplicate
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

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),
    };

    await supplierRef.update(
      data
    );

    revalidateTag(
      "wholesaleCutomer",
      "max"
    );

    revalidatePath(
      "/admin/stock-finished/supplier"
    );

    revalidatePath(
      `/admin/stock-finished/supplier/edit/${id}`
    );

    return {
      success: true,

      message:
        "Supplier updated successfully",
    };
  } catch (error) {
    console.error(
      "❌ Supplier update failed:",
      error
    );

    return {
      errors: {
        general:
          "Could not update supplier",
      },
    };
  }
}