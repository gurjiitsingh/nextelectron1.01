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

    // ✅ Get last balance
    const snapshot = await adminDb
      .collection("supplierLedger")
      .where("supplierId", "==", supplierId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    let prevBalance = 0;

    if (!snapshot.empty) {
      prevBalance =
        snapshot.docs[0].data().balance || 0;
    }

    // 🚨 Prevent overpayment (optional but recommended)
    if (amount > prevBalance) {
      return {
        errors: {
          amount: "Amount exceeds due balance",
        },
      };
    }

    const newBalance = prevBalance - amount;

    // ✅ Create PAYMENT entry
    await adminDb.collection("supplierLedger").add({
      supplierId,

      type: "PAYMENT",

      totalAmount: 0,
      paidAmount: amount,
      dueAmount: 0,

      paymentMethod,

      balance: newBalance,

      note: note || "Supplier payment",

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),
    });

    // 🔥 Revalidate
    revalidateTag("supplier-ledger", "max");
    revalidatePath(`/admin/inventory/supplier/${supplierId}`);

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