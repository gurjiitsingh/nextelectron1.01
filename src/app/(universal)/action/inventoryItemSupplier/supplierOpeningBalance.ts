"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

export async function supplierOpeningBalance(
  formData: FormData
) {
  try {
    const supplierId =
      (formData.get("supplierId") as string) || "";

    const openingBalance = Number(
      formData.get("amount") || 0
    );

    const note =
      (formData.get("note") as string)?.trim() || "";

    if (!supplierId || Number.isNaN(openingBalance)) {
      return {
        errors: {
          general: "Invalid opening balance.",
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

      // Prevent duplicate opening balance
      const existingLedger = await adminDb
        .collection("supplierLedger")
        .where("supplierId", "==", supplierId)
        .where("type", "==", "OPENING_BALANCE")
        .limit(1)
        .get();

      if (!existingLedger.empty) {
        throw new Error(
          "Opening balance already exists for this supplier."
        );
      }

      const dueBalance =
        openingBalance > 0 ? openingBalance : 0;

      const creditBalance =
        openingBalance < 0
          ? Math.abs(openingBalance)
          : 0;

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

        type: "OPENING_BALANCE",

        totalAmount: Math.abs(openingBalance),

        paidAmount: 0,

        dueAmount: dueBalance,

        creditAmount: creditBalance,

        previousBalance: 0,

        balanceChange: openingBalance,

        balance: dueBalance,

        referenceType: "OPENING_BALANCE",
        referenceId: ledgerRef.id,

        note:
          note || "Supplier opening balance",

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

    revalidatePath(
      `/admin/inventory/supplier/opening-balance/${supplierId}`
    );

    return {
      success: true,
      message:
        "Opening balance saved successfully.",
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