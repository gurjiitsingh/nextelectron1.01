"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function supplierBalanceAdjustment(
  formData: FormData
) {
  try {
    const supplierId =
      (formData.get("supplierId") as string) || "";

    const adjustmentType =
      (formData.get("adjustmentType") as
        | "INCREASE"
        | "DECREASE") || "INCREASE";

    const amount = Number(
      formData.get("amount") || 0
    );

    const reason =
      (formData.get("reason") as string)?.trim() || "";

    if (!supplierId || amount <= 0) {
      return {
        errors: {
          general: "Invalid adjustment.",
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

      const supplierName =
        account.supplierName || "";

      const previousBalance = Number(
        account.balance || 0
      );

      const balanceChange =
        adjustmentType === "INCREASE"
          ? amount
          : -amount;

      let dueBalance = Number(
        account.balance || 0
      );

      let creditBalance = Number(
        account.creditBalance || 0
      );

      // ============================
      // BALANCE ADJUSTMENT LOGIC
      // ============================

      if (adjustmentType === "INCREASE") {
        if (creditBalance > 0) {
          if (creditBalance >= amount) {
            // Existing advance covers everything
            creditBalance -= amount;
          } else {
            // Consume all advance,
            // remaining becomes due
            const remaining =
              amount - creditBalance;

            creditBalance = 0;
            dueBalance += remaining;
          }
        } else {
          dueBalance += amount;
        }
      } else {
        // DECREASE DUE

        if (dueBalance >= amount) {
          dueBalance -= amount;
        } else {
          // Due becomes zero,
          // extra becomes supplier advance
          const remaining =
            amount - dueBalance;

          dueBalance = 0;
          creditBalance += remaining;
        }
      }

      const newBalance = dueBalance;

      // ============================
      // UPDATE SUPPLIER ACCOUNT
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
      // SUPPLIER LEDGER
      // ============================

      const ledgerRef = adminDb
        .collection("supplierLedger")
        .doc();

      tx.set(ledgerRef, {
        transactionId: ledgerRef.id,

        supplierId,
        supplierName,

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
      "supplier-ledger",
      "max"
    );

    revalidateTag(
      "supplier-accounts",
      "max"
    );

    revalidatePath(
      `/admin/inventory/supplier/${supplierId}`
    );

    revalidatePath(
      `/admin/inventory/supplier/balance-adjustment/${supplierId}`
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
          error?.message ||
          "Something went wrong.",
      },
    };
  }
}