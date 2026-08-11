"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { BusinessFinancialType } from "@/lib/types/businessdata/BusinessFinancialType";
import { BUSINESS_FINANCIAL_DOC } from "@/lib/constant/businessFinancial";
 

export async function saveBusinessFinancial(
  data: BusinessFinancialType
) {
  try {
    await adminDb
      .collection("businessFinancials")
      .doc(BUSINESS_FINANCIAL_DOC)
      .set({
        cashInHand: Number(data.cashInHand || 0),
        cashInBank: Number(data.cashInBank || 0),

        expenseDue: Number(data.expenseDue || 0),
        loans: Number(data.loans || 0),

        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // revalidateTag("businessFinancials");
    // revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Business financials saved.",
    };
  } catch (error) {
    console.error("saveBusinessFinancial:", error);

    return {
      success: false,
      message: "Failed to save business financials.",
    };
  }
}