"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function customerBalanceAdjustment(
  formData: FormData
) {
  try {
    const customerId =
      (formData.get("customerId") as string) || "";

    const adjustmentType =
      (formData.get("adjustmentType") as
        | "INCREASE"
        | "DECREASE") || "INCREASE";

    const amount = Number(
      formData.get("amount") || 0
    );

    const reason =
      (formData.get("reason") as string)?.trim() || "";

    if (!customerId || amount <= 0) {
      return {
        errors: {
          general: "Invalid adjustment.",
        },
      };
    }

    await adminDb.runTransaction(async (tx) => {
      const accountRef = adminDb
        .collection("customerAccounts")
        .doc(customerId);

      const accountSnap = await tx.get(accountRef);

      if (!accountSnap.exists) {
        throw new Error("Customer account not found");
      }

      const account = accountSnap.data() || {};

      const customerName =
        account.customerName || "";

      const previousBalance = Number(
        account.balance || 0
      );

      const balanceChange =
        adjustmentType === "INCREASE"
          ? amount
          : -amount;

let dueBalance = Number(account.balance || 0);
let creditBalance = Number(account.creditBalance || 0);

if (adjustmentType === "INCREASE") {
  if (creditBalance > 0) {
    if (creditBalance >= amount) {
      // Credit covers everything
      creditBalance -= amount;
    } else {
      // Use all credit, remainder becomes due
      const remaining = amount - creditBalance;
      creditBalance = 0;
      dueBalance += remaining;
    }
  } else {
    dueBalance += amount;
  }
} else {
  // Decrease Due
  if (dueBalance >= amount) {
    dueBalance -= amount;
  } else {
    // Due becomes zero, extra becomes credit
    const remaining = amount - dueBalance;
    dueBalance = 0;
    creditBalance += remaining;
  }
}

const newBalance = dueBalance;

 // ============================
// UPDATE CUSTOMER ACCOUNT
// ============================

tx.set(
  accountRef,
  {
    balance: dueBalance,
    creditBalance,
    updatedAt:
      admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);
      // ============================
      // CUSTOMER LEDGER
      // ============================

      const ledgerRef = adminDb
        .collection("customerLedger")
        .doc();

     tx.set(ledgerRef, {
  transactionId: ledgerRef.id,

  customerId,
  customerName,

  type: "BALANCE_ADJUSTMENT",

  totalAmount: amount,

  paidAmount: 0,

  dueAmount: dueBalance,

  creditAmount: creditBalance,

  previousBalance,

  balanceChange,

  balance: newBalance,

  adjustmentType,

  referenceType: "BALANCE_ADJUSTMENT",
  referenceId: ledgerRef.id,

  note:
    reason ||
    `Balance ${
      adjustmentType === "INCREASE"
        ? "increased"
        : "decreased"
    }`,

  createdBy: "admin",
  source: "ADMIN",

  createdAt:
    admin.firestore.FieldValue.serverTimestamp(),
});
    });

    revalidateTag(
      "customer-ledger",
      "max"
    );

    revalidateTag(
      "customer-accounts",
      "max"
    );

    revalidatePath(
      `/customer/ledger/${customerId}`
    );

    revalidatePath(
      `/customer/ledger/balance-adjustment/${customerId}`
    );

    return {
      success: true,
      message:
        "Balance adjusted successfully.",
    };
  } catch (error: any) {
    return {
      errors: {
        general:
          error.message ||
          "Something went wrong.",
      },
    };
  }
}