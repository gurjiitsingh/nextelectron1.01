"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { BusinessFinancialType } from "@/lib/types/businessdata/BusinessFinancialType";
 

export async function fetchbusinessFinancials(): Promise<BusinessFinancialType> {
  try {
    const doc = await adminDb
      .collection("businessFinancials")
      .doc("main")
      .get();

    if (!doc.exists) {
      return {
        cashInHand: 0,
        cashInBank: 0,
        expenseDue: 0,
        loans: 0,
      };
    }

    const data = doc.data();

    return {
      cashInHand: Number(data?.cashInHand ?? 0),
      cashInBank: Number(data?.cashInBank ?? 0),

      expenseDue: Number(data?.expenseDue ?? 0),
      loans: Number(data?.loans ?? 0),

      updatedAt:
        data?.updatedAt?.toMillis?.() ?? Date.now(),
    };
  } catch (error) {
    console.error(error);

    return {
      cashInHand: 0,
      cashInBank: 0,
      expenseDue: 0,
      loans: 0,
    };
  }
}