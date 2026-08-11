"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";

type PaymentMethod = "CASH" | "UPI" | "CARD";

export async function paySupplierDue(formData: FormData) {


  try {
    const supplierId =
      (formData.get("supplierId") as string) || "";

    const amount = Number(formData.get("amount") || 0);

    const paymentMethod =
      (formData.get("paymentMethod") as PaymentMethod) || "CASH";
 
    const note =
      (formData.get("note") as string)?.trim() || "";
      

    if (!supplierId || amount <= 0) {
      return {
        errors: {
          general: "Invalid payment data",
        },
      };
    }

    // =====================================================
    // ✅ GET CURRENT BALANCE (SOURCE OF TRUTH)
    // =====================================================

    const accountRef = adminDb
      .collection("supplierAccounts")
      .doc(supplierId);

    const accountSnap = await accountRef.get();

    const currentBalance =
      Number(accountSnap.data()?.balance) || 0;

    // 🚨 Prevent overpayment
    if (amount > currentBalance) {
      return {
        errors: {
          amount: "Amount exceeds due balance",
        },
      };
    }

    const newBalance = currentBalance - amount;

    // =====================================================
    // 🔥 ATOMIC BATCH (VERY IMPORTANT)
    // =====================================================

    const batch = adminDb.batch();

    // 1️⃣ Update supplier account
    batch.set(
      accountRef,
      {
        supplierId,

        totalDebit:
          admin.firestore.FieldValue.increment(amount),
        totalPaid:
          admin.firestore.FieldValue.increment(amount),

        // payment method tracking
        ...(paymentMethod === "CASH" && {
          cashPaid:
            admin.firestore.FieldValue.increment(amount),
        }),
        ...(paymentMethod === "UPI" && {
          upiPaid:
            admin.firestore.FieldValue.increment(amount),
        }),
        ...(paymentMethod === "CARD" && {
          cardPaid:
            admin.firestore.FieldValue.increment(amount),
        }),

        balance:
          admin.firestore.FieldValue.increment(-amount),

        updatedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2️⃣ Add ledger entry (history only)
    const ledgerRef = adminDb
      .collection("customerLedger")
      .doc();

    batch.set(ledgerRef, {
      supplierId,

      type: "PAYMENT",

      totalAmount: 0,
      paidAmount: amount,
      dueAmount: 0,

      paymentMethod,

      balance: newBalance, // optional snapshot

      note: note || "Supplier payment",

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // =====================================================
    // 🔁 REVALIDATE
    // =====================================================

    revalidateTag("supplier-ledger", "max");
    revalidatePath(`/admin/stock-finished/supplier/${supplierId}`);

    return {
      success: true,
      message: "Payment recorded",
    };
  } catch (error) {
    console.error("❌ Payment failed:", error);

    return {
      errors: {
        general: "Something went wrong",
      },
    };
  }
}