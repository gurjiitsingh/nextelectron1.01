"use server";

import { BUSINESS_FINANCIAL_DOC } from "@/lib/constant/businessFinancial";
import { adminDb } from "@/lib/firebaseAdmin";
 

export async function getBusinessFinancialSummary() {
  try {
    const doc = await adminDb
      .collection("businessFinancials")
      .doc(BUSINESS_FINANCIAL_DOC)
      .get();

    if (!doc.exists) {
      return {
        success: true,
        data: {
          cashInHand: 0,
          cashInBank: 0,
          expenseDue: 0,
          loans: 0,
        },
      };
    }

    const data = doc.data();

    return {
      success: true,
      data: {
        cashInHand: Number(data?.cashInHand || 0),
        cashInBank: Number(data?.cashInBank || 0),
        expenseDue: Number(data?.expenseDue || 0),
        loans: Number(data?.loans || 0),
      },
    };
  } catch (error) {
    console.error("getBusinessFinancialSummary:", error);

    return {
      success: false,
      data: {
        cashInHand: 0,
        cashInBank: 0,
        expenseDue: 0,
        loans: 0,
      },
      message: "Failed to load business financials.",
    };
  }
}