"use server";

import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebaseAdmin";
 
import { BusinessFinancialField } from "@/lib/types/businessdata/BusinessFinancialField";
import { BUSINESS_FINANCIAL_DOC } from "@/lib/constant/businessFinancial";

export async function updateBusinessFinancialField(
  field: BusinessFinancialField,
  value: number
) {
  try {
    await adminDb
      .collection("businessFinancials")
      .doc(BUSINESS_FINANCIAL_DOC)
      .set(
        {
          [field]: Number(value || 0),

          updatedAt:
            admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

    // revalidateTag("businessFinancials");
    // revalidatePath("/admin/dashboard");
    revalidatePath("/admin/stock-finished/account");

    return {
      success: true,
      message: `${field} updated successfully.`,
    };
  } catch (error) {
    console.error("updateBusinessFinancialField:", error);

    return {
      success: false,
      message: "Failed to update financial data.",
    };
  }
}