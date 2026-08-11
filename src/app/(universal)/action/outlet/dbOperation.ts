"use server";


import { upload, uploadOutletLogo } from "@/lib/cloudinary";
import { countryConfig } from "@/lib/config/countryConfig";
import { adminDb } from "@/lib/firebaseAdmin";
import { outletSchema, POS_TYPES, PosType } from "@/lib/types/outletType";
import { FieldValue } from "firebase-admin/firestore";
import { cache } from "react";


// =====================================================// SAVE OUTLET// =====================================================
export async function saveOutlet(input: any) {
  console.log("in----------------", input)
  
  const parsed = outletSchema.safeParse(input);

  // Validation failed
  if (!parsed.success) {
    console.log(
      'ZOD VALIDATION FAILED',
      parsed.error.flatten()
    );

    const fieldErrors =
      parsed.error.flatten().fieldErrors;

    return {
      success: false,
      errors: fieldErrors,
      message: 'Please fill all required fields.',
    };
  }

  const data = parsed.data;

  console.log(
    'PARSED DATA ----------------',
    JSON.stringify(data, null, 2)
  );

  // Country config
  const config =
    countryConfig[data.countryCode];

  if (!config) {
    return {
      success: false,
      errors: {
        countryCode: ['Invalid country selected'],
      },
      message: 'Invalid country selected.',
    };
  }

  // Update mode?
  const outletId = data.outletId;

  // Base payload
  const payload: any = {
    outletName: data.outletName,

    addressLine1: data.addressLine1,
    city: data.city,

    printerWidth: Number(data.printerWidth),

    isActive: data.isActive,

    // QR
    qrEnabled: data.qrEnabled,
    qrText: data.qrText,
    qrTitle: data.qrTitle,

    // Country
    countryCode: data.countryCode,
    countryName: config.name,
    currencyCode: config.code,
    localeTag: config.locale,

    // Tax
    taxMode: data.taxMode,

    updatedAt: FieldValue.serverTimestamp(),
  };

  console.log(
    'PAYLOAD BEFORE OPTIONALS ----',
    payload
  );

  // Helper
  function setOrDelete(
    key: string,
    value: any
  ) {
    const isEmpty =
      value === '' ||
      value === undefined ||
      value === null;

    console.log(
      'setOrDelete',
      key,
      value,
      'isEmpty=',
      isEmpty
    );

    if (outletId) {
      payload[key] = isEmpty
        ? FieldValue.delete()
        : value;
      return;
    }

    if (!isEmpty) {
      payload[key] = value;
    }
  }

  // Optional fields
  setOrDelete('ownerId', data.ownerId);

  setOrDelete('addressLine2', data.addressLine2);
  setOrDelete('addressLine3', data.addressLine3);

  setOrDelete('state', data.state);
  setOrDelete('zipcode', data.zipcode);

  setOrDelete('phone', data.phone);
  setOrDelete('phone2', data.phone2);

  setOrDelete('email', data.email);
  setOrDelete('web', data.web);

  setOrDelete('taxType', data.taxType);
  setOrDelete('gstVatNumber', data.gstVatNumber);

  setOrDelete('footerNote', data.footerNote);

  setOrDelete('upiId', data.upiId);
  setOrDelete('upiName', data.upiName);
  setOrDelete('upiTitle', data.upiTitle);

  console.log(
    'FINAL PAYLOAD ---------------',
    payload
  );

  try {
    // UPDATE
    if (outletId) {
      await adminDb
        .collection('outlets')
        .doc(outletId)
        .update(payload);

      return {
        success: true,
        outletId,
        message: 'Outlet updated successfully.',
      };
    }

    // CREATE
    const docRef = await adminDb
      .collection('outlets')
      .add({
        ...payload,
        createdAt:
          FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      outletId: docRef.id,
      message: 'Outlet created successfully.',
    };
  } catch (error: any) {
    console.error(
      'FIRESTORE ERROR ------------',
      error
    );

    return {
      success: false,
      errors: {
        general: [
          error.message ||
            'Firestore error',
        ],
      },
      message:
        error.message ||
        'Failed to save outlet.',
    };
  }
}




  // app/(universal)/action/outlet/fetchOutlet.ts


  export async function fetchOutletInternal() {

    const snap = await adminDb
      .collection("outlets")
      .limit(1)
      .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];

    return {
      outletId: doc.id,
      ...doc.data(),
    };
  }



  export async function deleteOutlet(outletId: string) {
    if (!outletId) {
      return { errors: { outletId: "Outlet ID is required" } };
    }

    try {
      const ref = adminDb.collection("outlets").doc(outletId);
      const snap = await ref.get();

      if (!snap.exists) {
        return { errors: { general: "Outlet not found" } };
      }

      // 🔒 SAFETY: single-outlet system guard
      await ref.delete();

      return { success: true };
    } catch (error) {
      console.error("❌ Outlet delete failed:", error);
      return { errors: { general: "Failed to delete outlet" } };
    }
  }


export const getOutlet = cache(async () => {

  const snap = await adminDb
    .collection("outlets")
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];

  const data = doc.data();

  return {

    outletId: doc.id,

    // =================================================
    // BASIC
    // =================================================
    outletName: data.outletName,

    // =================================================
    // ADDRESS
    // =================================================
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    addressLine3: data.addressLine3,

    city: data.city,
    state: data.state,
    zipcode: data.zipcode,

    // =================================================
    // COUNTRY
    // =================================================
    countryCode: data.countryCode,
    countryName: data.countryName,

    // =================================================
    // CURRENCY
    // =================================================
    currencyCode: data.currencyCode,
    localeTag: data.localeTag,

    // =================================================
    // CONTACT
    // =================================================
    phone: data.phone,
    phone2: data.phone2,

    email: data.email,
    web: data.web,

    // =================================================
    // TAX
    // =================================================
    taxType: data.taxType,
    gstVatNumber: data.gstVatNumber,

    // =================================================
    // PRINTER
    // =================================================
    printerWidth: data.printerWidth,

    footerNote: data.footerNote,

    // =================================================
    // QR SETTINGS
    // =================================================
    qrEnabled: data.qrEnabled ?? false,

    qrText: data.qrText ?? "",
    qrTitle: data.qrTitle ?? "",

    // =================================================
    // UPI
    // =================================================
    upiId: data.upiId ?? "",
    upiName: data.upiName ?? "",
    upiTitle: data.upiTitle ?? "Scan to Pay",

    posType: data.posType ?? "RESTAU_POS", 
    
    // =================================================
    // STATUS
    // =================================================
    isActive: data.isActive,

    // =================================================
    // DATE
    // =================================================
    updatedAt: data.updatedAt
      ? data.updatedAt.toDate().toISOString()
      : null,
  };
});



  export async function updateOutletLogo(formData: FormData) {

  

    try {

      const outletId = formData.get("outletId") as string;

      const image = formData.get("image");

      // =================================================
      // VALIDATION
      // =================================================
      if (!outletId) {

        return {
          errors: {
            general: "Outlet ID missing",
          },
        };
      }

      if (!image || image === "0") {

        return {
          errors: {
            image: "Logo image required",
          },
        };
      }

      // =================================================
      // UPLOAD IMAGE
      // =================================================
      let logoUrl = "";

      try {

        const uploadRes = await uploadOutletLogo(
          image as File,
          outletId
        );

        logoUrl = uploadRes.url;

        console.log(
          "Logo url :",
          logoUrl,
          outletId
        );

      } catch (error) {

        console.error("Logo upload failed", error);

        return {
          errors: {
            image: "Logo upload failed",
          },
        };
      }

      // =================================================
      // UPDATE FIRESTORE
      // =================================================
      await adminDb
        .collection("outlets")
        .doc(outletId)
        .update({

          // ✅ LOGO
          logoUrl,

          // ✅ UPDATED DATE
          updatedAt: FieldValue.serverTimestamp(),
        });

      // =================================================
      // SUCCESS
      // =================================================
      return {
        success: true,

        message: "Logo updated successfully",

        logoUrl,
      };

    } catch (error) {

      console.error("❌ Logo update failed:", error);

      return {
        errors: {
          general: "Could not update logo",
        },
      };
    }
  }







export async function updatePosType(formData: FormData): Promise<void> {
  const outletId = formData.get("outletId") as string;
  const posType = formData.get("posType") as string;

  if (!outletId || !posType) {
    throw new Error("Missing data");
  }

  await adminDb.collection("outlets").doc(outletId).update({
    posType,
    updatedAt: FieldValue.serverTimestamp(),
  });
}


export async function updateOutletPosType(
  outletId: string,
  posType: PosType
) {
 
  if (!Object.values(POS_TYPES).includes(posType)) {
    return {
      errors: { posType: "Invalid POS type" },
    };
  }

  if (!outletId) {
    return {
      errors: { outletId: "Outlet ID required" },
    };
  }

  try {
    await adminDb
      .collection("outlets")
      .doc(outletId)
      .update({
        posType,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return { success: true };

  } catch (error) {
    console.error("POS type update failed:", error);

    return {
      errors: { general: "Failed to update POS type" },
    };
  }
}