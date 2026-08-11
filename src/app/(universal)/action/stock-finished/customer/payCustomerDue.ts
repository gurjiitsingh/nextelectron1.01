"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "CHECK"
  | "BANK_TRANSFER";

export async function payCustomerDue(formData: FormData) {
  try {
    const customerId =
      (formData.get("customerId") as string) || "";

    const amount = Number(
      formData.get("amount") || 0
    );

    const paymentMethod =
      (formData.get("paymentMethod") as PaymentMethod) ||
      "CASH";


    const referenceNumber =
      (formData.get("referenceNumber") as string)?.trim() || "";

    const bankName =
      (formData.get("bankName") as string)?.trim() || "";

    const paymentDate =
      (formData.get("paymentDate") as string)?.trim() || "";

    const note =
      (formData.get("note") as string)?.trim() || "";

    if (!customerId || amount <= 0) {
      return {
        errors: {
          general: "Invalid payment data",
        },
      };
    }

    await adminDb.runTransaction(async (tx) => {
      const accountRef = adminDb
        .collection("customerAccounts")
        .doc(customerId);

      const accountSnap = await tx.get(accountRef);

      if (!accountSnap.exists) {
        throw new Error(
          "Customer account not found"
        );
      }

      const account = accountSnap.data() || {};

      const currentBalance =
        Number(account.balance || 0);

      // if (amount > currentBalance) {
      //   throw new Error(
      //     "Amount exceeds due balance"
      //   );
      // }

      const currentDue = Number(account.balance || 0);
      let currentCredit = Number(account.creditBalance || 0);

      let newDue = currentDue;
      let newCredit = currentCredit;

      if (amount >= currentDue) {
        // Pay all due, remainder becomes customer credit
        const advance = amount - currentDue;

        newDue = 0;
        newCredit += advance;
      } else {
        // Partial payment
        newDue = currentDue - amount;
      }

      const customerName =
        account.customerName || "";

      let cash = 0;
      let upi = 0;
      let card = 0;
      let check = 0;
      let bankTransfer = 0;

      if (paymentMethod === "CASH") cash = amount;
      if (paymentMethod === "UPI") upi = amount;
      if (paymentMethod === "CARD") card = amount;
      if (paymentMethod === "CHECK") check = amount;
      if (paymentMethod === "BANK_TRANSFER") bankTransfer = amount;

      // ======================================
      // UPDATE CUSTOMER ACCOUNT
      // ======================================

      tx.set(
        accountRef,
        {
          customerId,
          customerName,

          totalCredit:
            admin.firestore.FieldValue.increment(amount),

          totalPaid:
            admin.firestore.FieldValue.increment(amount),

          cashPaid:
            admin.firestore.FieldValue.increment(cash),

          upiPaid:
            admin.firestore.FieldValue.increment(upi),

          cardPaid:
            admin.firestore.FieldValue.increment(card),

          checkPaid:
            admin.firestore.FieldValue.increment(check),

          bankTransferPaid:
            admin.firestore.FieldValue.increment(bankTransfer),

          balance: newDue,

          creditBalance: newCredit,

          updatedAt:
            admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // ======================================
      // CUSTOMER LEDGER
      // ======================================

      const ledgerRef = adminDb
        .collection("customerLedger")
        .doc();

     tx.set(ledgerRef, {
  transactionId: ledgerRef.id,

  customerId,
  customerName,

  type: "PAYMENT",

  totalAmount: amount,
  paidAmount: amount,

  dueAmount: newDue,
  creditAmount: newCredit,

  balance: newDue,

  paymentMethod,

  // New fields
  referenceNumber,
  bankName,
  paymentDate,

  referenceType: "PAYMENT",
  referenceId: ledgerRef.id,

  note: note || "Customer payment",

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
      `/admin/customer/${customerId}`
    );

    return {
      success: true,
      message: "Payment recorded",
    };
  } catch (error: any) {
    return {
      errors: {
        general:
          error.message ||
          "Something went wrong",
      },
    };
  }
}