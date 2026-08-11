"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function customerOpeningBalance(
  formData: FormData
) {
  try {
    const customerId =
      (formData.get("customerId") as string) || "";

    const openingBalance = Number(
      formData.get("amount") || 0
    );

    const note =
      (formData.get("note") as string)?.trim() || "";

    if (!customerId || Number.isNaN(openingBalance)) {
      return {
        errors: {
          general: "Invalid opening balance.",
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

      // Prevent duplicate opening balance
      const existingLedger = await adminDb
        .collection("customerLedger")
        .where("customerId", "==", customerId)
        .where("type", "==", "OPENING_BALANCE")
        .limit(1)
        .get();

      if (!existingLedger.empty) {
        throw new Error(
          "Opening balance already exists for this customer."
        );
      }

      // ============================
      // UPDATE CUSTOMER ACCOUNT
      // ============================

      tx.set(
        accountRef,
        {
          balance: openingBalance,
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

        type: "OPENING_BALANCE",

        totalAmount: Math.abs(openingBalance),

        paidAmount: 0,

        dueAmount:
          openingBalance > 0
            ? openingBalance
            : 0,

        creditAmount:
          openingBalance < 0
            ? Math.abs(openingBalance)
            : 0,

        balance: openingBalance,

        previousBalance: 0,

        balanceChange: openingBalance,

        referenceType: "OPENING_BALANCE",
        referenceId: ledgerRef.id,

        note:
          note || "Customer opening balance",

        createdBy: "admin",
        source: "ADMIN",

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    revalidateTag("customer-ledger", "max");
    revalidateTag("customer-accounts", "max");

    revalidatePath(`/customer/ledger/${customerId}`);
    revalidatePath(
      `/customer/ledger/opening-balance/${customerId}`
    );

    return {
      success: true,
      message: "Opening balance saved successfully.",
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