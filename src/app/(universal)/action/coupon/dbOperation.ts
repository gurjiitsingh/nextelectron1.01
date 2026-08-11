'use server';

import { deleteImage, upload } from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { couponType, couponSchema } from "@/lib/types/couponType";
import { formatPriceStringToNumber } from "@/utils/formatters";

// ---------------- Add New Coupon ----------------
export async function addNewcoupon(formData: FormData) {
  const receivedData = {
    code: formData.get("code"),
    discount: formData.get("discount"),
    minSpend: formData.get("minSpend"),
    productCat: formData.get("productCat"),
    couponDesc: formData.get("couponDesc"),
    offerType: formData.get("offerType"),
    expiry: formData.get("expiry"),
    discountType: formData.get("discountType"),
    isFeatured: false,
  };

  const result = couponSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
    return { errors: zodErrors };
  }

  const now_german = new Date().toLocaleString("en-DE", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Berlin",
  });

  const data = {
    ...receivedData,
    discount: formatPriceStringToNumber(receivedData.discount),
    minSpend: formatPriceStringToNumber(receivedData.minSpend),
    isActivated: true,
    startDate: now_german,
    date: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };

  try {
    const docRef = await adminDb.collection("coupon").add(data);
    console.log("Coupon added with ID:", docRef.id);
    return { message: "coupon saved" };
  } catch (e) {
    console.error("Error adding coupon:", e);
    return { error: "Failed to add coupon" };
  }
}

// ---------------- Delete Coupon ----------------
type rt = { success: string };
export async function deletecoupon(id: string): Promise<rt> {
  await adminDb.collection("coupon").doc(id).delete();
  return { success: "Delete implemented" };
}

// ---------------- Edit Coupon ----------------
export async function editcoupon(id: string, formData: FormData) {
  try {
    const updatedData = {
      code: formData.get("code"),
      discount: formatPriceStringToNumber(formData.get("discount")),
      offerType: formData.get("offerType"),
      expiry: formData.get("expiry"),
      discountType: formData.get("discountType"),
      productCat: formData.get("productCat"),
      couponDesc: formData.get("couponDesc"),
      message: formData.get("message"),
      minSpend: formatPriceStringToNumber(formData.get("minSpend")),
      isFeatured: formData.get("isFeatured") === "true",
    };

    await adminDb.collection("coupon").doc(id).update(updatedData);
    return { success: true };
  } catch (error) {
    console.error("Failed to update coupon:", error);
    return { success: false, error: "Failed to update coupon." };
  }
}

// ---------------- Edit Coupon v1 ----------------
export async function editcoupon1(formData: FormData) {
  const id = formData.get("id") as string;
  const featured_img = false;

  const receivedData = {
    code: formData.get("code"),
    discount: formData.get("discount"),
    productCat: formData.get("productCat"),
    couponDesc: formData.get("couponDesc"),
    minSpend: formData.get("minSpend"),
    isFeatured: featured_img,
  };

  const result = couponSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path[0], issue.message])
    );
    return { errors: zodErrors };
  }

  const couponUpdatedData = {
    ...receivedData,
    discount: formatPriceStringToNumber(receivedData.discount),
    minSpend: formatPriceStringToNumber(receivedData.minSpend),
  };

  try {
    await adminDb.collection("coupon").doc(id).set(couponUpdatedData, { merge: true });
    return { success: true };
  } catch (error) {
    console.log("error", error);
    return { errors: "Cannot update" };
  }
}

// ---------------- Fetch All Coupons ----------------
export async function fetchcoupon(): Promise<couponType[]> {
  const result = await adminDb.collection("coupon").get();
  const data: couponType[] = [];

  result.forEach((doc) => {
    const raw = doc.data();
    data.push({
      id: doc.id,
      code: raw.code,
      message: raw.message,
      discount: raw.discount,
      productCat: raw.productCat,
      couponDesc: raw.couponDesc,
      discountType: raw.discountType,
      offerType: raw.offerType,
      minSpend: raw.minSpend,
      isFeatured: raw.isFeatured,
      isActivated: raw.isActivated,
      applyPickup: raw.applyPickup ?? true,
      applyDelivery: raw.applyDelivery ?? true,
      excludedCategoryIds: raw.excludedCategoryIds ?? [],
      image: raw.image ?? null,
      startDate: raw.startDate ?? null,
      expiry: raw.expiry ?? null,
      createdAt: raw.createdAt?.toDate?.() ?? undefined,
      date: raw.date?.toDate?.() ?? new Date(),
    });
  });

  return data;
}

// ---------------- Fetch Coupon By ID ----------------
export async function fetchcouponById(id: string): Promise<couponType> {
  const docSnap = await adminDb.collection("coupon").doc(id).get();

  if (!docSnap.exists) throw new Error("Coupon not found");

  const raw = docSnap.data()!; // <-- Assert non-null

  return {
    id: docSnap.id,
    code: raw.code,
    message: raw.message,
    discount: raw.discount,
    productCat: raw.productCat,
    couponDesc: raw.couponDesc,
    minSpend: raw.minSpend,
    excludedCategoryIds: raw.excludedCategoryIds ?? [],
    offerType: raw.offerType,
    isFeatured: raw.isFeatured,
    applyPickup: raw.applyPickup ?? true,
    applyDelivery: raw.applyDelivery ?? true,
    isActivated: raw.isActivated,
    expiry: raw.expiry,
    discountType: raw.discountType,
    startDate: raw.startDate,
    date: raw.date?.toDate?.()?.toISOString?.() ?? undefined,
    createdAt: raw.createdAt?.toDate?.() ?? undefined,
    image: raw.image ?? null,
  };
}


// ---------------- Fetch Coupon By Code ----------------
export async function fetchcouponByCode(condname: string): Promise<couponType[]> {
  const q = await adminDb.collection("coupon").where("code", "==", condname).get();
  const data: couponType[] = [];

  q.forEach((doc) => {
    const raw = doc.data();
    data.push({
      id: doc.id,
      code: raw.code,
      discount: raw.discount,
      discountType: raw.discountType,
      message: raw.message,
      minSpend: raw.minSpend,
      expiry: raw.expiry,
      startDate: raw.startDate,
      offerType: raw.offerType,
      isActivated: raw.isActivated,
      isFeatured: raw.isFeatured,
      applyPickup: raw.applyPickup ?? true,
      applyDelivery: raw.applyDelivery ?? true,
      productCat: raw.productCat,
      couponDesc: raw.couponDesc,
      excludedCategoryIds: raw.excludedCategoryIds,
      createdAt: raw.createdAt?.toDate?.() ?? undefined,
      date: raw.date?.toDate?.() ?? new Date(),
      image: raw.image,
    });
  });

  return data;
}

// ---------------- Update Excluded Categories ----------------
export async function updateCouponExcludedCategories(
  couponId: string,
  categoryIds: string[]
) {
  await adminDb.collection("coupon").doc(couponId).update({
    excludedCategoryIds: categoryIds,
  });
}

// ---------------- Fetch Raw Snapshot ----------------
export async function fetchSingleCoupon(id: string) {
  const snapshot = await adminDb.collection("coupon").doc(id).get();
  return snapshot.exists ? snapshot.data() : null;
}
