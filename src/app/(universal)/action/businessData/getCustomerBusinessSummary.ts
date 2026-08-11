"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function getCustomerBusinessSummary() {
  try {
    const snapshot = await adminDb
      .collection("customerAccounts")
      .get();

    let amountToReceive = 0; // Customers owe the business
    let amountToPay = 0;     // Business owes customers (advance/credit)

    snapshot.forEach((doc) => {
      const data = doc.data();
      const credit = Number(data.creditBalance ?? 0);
      const balance = Number(data.balance ?? 0);
    
      if (balance > 0) {
        amountToReceive += balance;
      }
   
      amountToPay += credit;

    });






    return {
      success: true,
      data: {
        amountToReceive,
        amountToPay,
      },
    };
  } catch (error) {
    console.error("getCustomerBusinessSummary:", error);

    return {
      success: false,
      data: {
        amountToReceive: 0,
        amountToPay: 0,
      },
      message: "Failed to load customer summary.",
    };
  }
}