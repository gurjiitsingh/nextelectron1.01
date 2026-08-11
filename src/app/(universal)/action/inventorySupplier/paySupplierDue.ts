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

export async function paySupplierDue(formData: FormData) {
  try {
    const supplierId =
      (formData.get("supplierId") as string) || "";

    const amount = Number(formData.get("amount") || 0);

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

    if (!supplierId || amount <= 0) {
      return {
        errors: {
          general: "Invalid payment data",
        },
      };
    }

    await adminDb.runTransaction(async (tx) => {
      const accountRef = adminDb
        .collection("supplierAccounts")
        .doc(supplierId);

      const accountSnap = await tx.get(accountRef);

      if (!accountSnap.exists) {
        throw new Error("Supplier account not found");
      }

      const account = accountSnap.data() || {};

      const currentDue = Number(account.balance || 0);
      let currentCredit = Number(account.creditBalance || 0);

      let newDue = currentDue;
      let newCredit = currentCredit;

      // ======================================
      // PAYMENT LOGIC
      // ======================================

      if (amount >= currentDue) {
        // Clear all due, remaining becomes supplier advance
        const advance = amount - currentDue;

        newDue = 0;
        newCredit += advance;
      } else {
        // Partial payment
        newDue = currentDue - amount;
      }

      const supplierName =
        account.supplierName || "";

      let cash = 0;
      let upi = 0;
      let card = 0;
      let check = 0;
      let bankTransfer = 0;

      switch (paymentMethod) {
        case "CASH":
          cash = amount;
          break;

        case "UPI":
          upi = amount;
          break;

        case "CARD":
          card = amount;
          break;

        case "CHECK":
          check = amount;
          break;

        case "BANK_TRANSFER":
          bankTransfer = amount;
          break;
      }

      // ======================================
      // UPDATE SUPPLIER ACCOUNT
      // ======================================

      tx.set(
        accountRef,
        {
          supplierId,
          supplierName,

          totalDebit:
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
      // SUPPLIER LEDGER
      // ======================================

      const ledgerRef = adminDb
        .collection("supplierLedger")
        .doc();

      tx.set(ledgerRef, {
        transactionId: ledgerRef.id,

        supplierId,
        supplierName,

        type: "PAYMENT",

        totalAmount: amount,
        paidAmount: amount,

        dueAmount: newDue,
        creditAmount: newCredit,

        balance: newDue,

        paymentMethod,

        referenceNumber,
        bankName,

        paymentDate: paymentDate
          ? admin.firestore.Timestamp.fromDate(
              new Date(paymentDate)
            )
          : null,

        referenceType: "PAYMENT",
        referenceId: ledgerRef.id,

        note: note || "Supplier payment",

        createdBy: "admin",
        source: "ADMIN",

        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    revalidateTag("supplier-ledger", "max");
    revalidateTag("supplier-accounts", "max");

    revalidatePath(
      `/admin/inventory/supplier/${supplierId}`
    );

    return {
      success: true,
      message: "Payment recorded",
    };
  } catch (error: any) {
    return {
      errors: {
        general:
          error?.message || "Something went wrong",
      },
    };
  }
}